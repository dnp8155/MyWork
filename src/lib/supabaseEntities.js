import { getSupabase } from "./supabaseClient";

// Entity name (PascalCase) → Supabase table name (snake_case plural)
const tableMap = {
  Client: "clients",
  Project: "projects",
  Invoice: "invoices",
  Quotation: "quotations",
  Payment: "payments",
  Expense: "expenses",
  Transaction: "transactions",
  Domain: "domains",
  HostingAccount: "hosting_accounts",
  Base44Account: "base44_accounts",
  Credential: "credentials",
  ProjectMember: "project_members",
  ProjectDocument: "project_documents",
  RecurringPaymentSchedule: "recurring_payment_schedules",
  Notification: "notifications",
  AuditLog: "audit_logs",
  CompanySettings: "company_settings",
};

// Supabase rejects empty strings for date/timestamp/number/bool columns.
// Convert empty strings to null so forms can omit optional fields safely.
function cleanRecord(rec) {
  const out = {};
  for (const [k, v] of Object.entries(rec)) {
    out[k] = v === "" ? null : v;
  }
  return out;
}

async function getUserId() {
  try {
    const sb = await getSupabase();
    const { data: { user } } = await sb.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

// Translates MongoDB-style filter queries to Supabase PostgREST filters
function applyFilter(q, query) {
  if (!query || typeof query !== "object") return q;
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      q = q.is(key, null);
    } else if (typeof value === "object" && !Array.isArray(value)) {
      for (const [op, opVal] of Object.entries(value)) {
        if (op === "$gte") q = q.gte(key, opVal);
        else if (op === "$lte") q = q.lte(key, opVal);
        else if (op === "$gt") q = q.gt(key, opVal);
        else if (op === "$lt") q = q.lt(key, opVal);
        else if (op === "$ne") q = q.neq(key, opVal);
        else if (op === "$in") q = q.in(key, opVal);
        else if (op === "$nin") q = q.not(key, opVal);
        else q = q.eq(key, opVal);
      }
    } else {
      q = q.eq(key, value);
    }
  }
  return q;
}

function applySort(q, sort) {
  if (!sort) return q.order("created_at", { ascending: false });
  const desc = sort.startsWith("-");
  const col = desc ? sort.slice(1) : sort;
  // Map Base44's created_date to Supabase's created_at
  const actualCol = col === "created_date" ? "created_at" : col;
  return q.order(actualCol, { ascending: !desc });
}

function makeEntity(entityName) {
  const table = tableMap[entityName];

  return {
    async list(sort, limit) {
      const sb = await getSupabase();
      let q = sb.from(table).select("*");
      q = applySort(q, sort);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },

    async filter(query, sort, limit) {
      const sb = await getSupabase();
      let q = sb.from(table).select("*");
      q = applyFilter(q, query);
      q = applySort(q, sort);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },

    async get(id) {
      const sb = await getSupabase();
      const { data, error } = await sb.from(table).select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },

    async create(record) {
      const sb = await getSupabase();
      const userId = await getUserId();
      const payload = cleanRecord(record);
      if (userId && !payload.created_by_id) payload.created_by_id = userId;
      const { data, error } = await sb.from(table).insert(payload).select().single();
      if (error) throw error;
      return data;
    },

    async bulkCreate(records) {
      const sb = await getSupabase();
      const userId = await getUserId();
      const payload = records.map((r) => {
        const c = cleanRecord(r);
        return userId && !c.created_by_id ? { ...c, created_by_id: userId } : c;
      });
      const { data, error } = await sb.from(table).insert(payload).select();
      if (error) throw error;
      return data || [];
    },

    async update(id, changes) {
      const sb = await getSupabase();
      const { data, error } = await sb
        .from(table)
        .update(cleanRecord(changes))
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async updateMany(query, update) {
      const sb = await getSupabase();
      const setFields = cleanRecord((update && update.$set) || update);
      let q = sb.from(table).update(setFields);
      q = applyFilter(q, query);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },

    async bulkUpdate(records) {
      const sb = await getSupabase();
      const { data, error } = await sb
        .from(table)
        .upsert(records, { onConflict: "id" })
        .select();
      if (error) throw error;
      return data || [];
    },

    async delete(id) {
      const sb = await getSupabase();
      const { error } = await sb.from(table).delete().eq("id", id);
      if (error) throw error;
      return { id };
    },

    async deleteMany(query) {
      const sb = await getSupabase();
      let q = sb.from(table).delete();
      q = applyFilter(q, query);
      const { error } = await q;
      if (error) throw error;
      return [];
    },

    subscribe(callback) {
      let channel = null;
      let unsubscribed = false;
      (async () => {
        const sb = await getSupabase();
        if (unsubscribed) return;
        channel = sb
          .channel(`${table}_changes`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table },
            (payload) => {
              const type =
                payload.eventType === "INSERT"
                  ? "create"
                  : payload.eventType === "UPDATE"
                  ? "update"
                  : "delete";
              callback({
                id: payload.new?.id || payload.old?.id,
                type,
                data: payload.new || payload.old,
              });
            }
          )
          .subscribe();
      })();
      return () => {
        unsubscribed = true;
        if (channel) channel.unsubscribe();
      };
    },

    schema() {
      return { type: "object", properties: {} };
    },
  };
}

const supabaseEntities = {};
for (const name of Object.keys(tableMap)) {
  supabaseEntities[name] = makeEntity(name);
}

export { supabaseEntities };