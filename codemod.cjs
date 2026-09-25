const fs = require('fs');
const path = require('path');

const ENTITY_TO_TABLE = {
  Client: 'clients',
  Base44Account: 'base44_accounts',
  Project: 'projects',
  Payment: 'payments',
  RecurringPaymentSchedule: 'recurring_payment_schedules',
  Quotation: 'quotations',
  Invoice: 'invoices',
  Domain: 'domains',
  HostingAccount: 'hosting_accounts',
  Expense: 'expenses',
  Transaction: 'transactions',
  Notification: 'notifications',
  AuditLog: 'audit_logs',
  CompanySettings: 'company_settings',
  Credential: 'credentials',
  ProjectMember: 'project_members',
  ProjectDocument: 'project_documents'
};

function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walkSync(filepath, callback);
    } else if (filepath.endsWith('.js') || filepath.endsWith('.jsx')) {
      callback(filepath);
    }
  }
}

walkSync(path.join(__dirname, 'src'), (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let originalContent = content;

  // Replace import
  content = content.replace(/import\s+\{\s*base44\s*\}\s+from\s+["']@\/api\/base44Client["']/g, 'import { supabase } from "@/api/supabaseClient"');

  // Replace .list()
  for (const [entity, table] of Object.entries(ENTITY_TO_TABLE)) {
    const listRegex = new RegExp(`base44\\.entities\\.${entity}\\.list\\(\\s*\\)`, 'g');
    content = content.replace(listRegex, `supabase.from('${table}').select('*')`);
  }

  // Replace .create({ ... }) with .insert({ ... })
  for (const [entity, table] of Object.entries(ENTITY_TO_TABLE)) {
    const createRegex = new RegExp(`base44\\.entities\\.${entity}\\.create`, 'g');
    content = content.replace(createRegex, `supabase.from('${table}').insert`);
  }

  // Replace .update({ where: { id: ID }, data: { DATA } }) with .update({ DATA }).eq('id', ID)
  // We need to carefully extract ID and DATA.
  // We will assume the exact format: .update({ where: { id: SOMETHING }, data: { SOMETHING_ELSE } })
  // Regex: \.update\(\s*\{\s*where:\s*\{\s*id:\s*([^}]+)\s*\},\s*data:\s*(\{.*?\})\s*\}\s*\)
  // This handles simple objects, but might break on nested ones. 
  // Let's use string manipulation for update and delete to be safe.
  
  let pos = 0;
  while ((pos = content.indexOf('.update({ where: { id: ', pos)) !== -1) {
    let endOfId = content.indexOf(' }, data: ', pos);
    if (endOfId === -1) {
      pos += 1;
      continue;
    }
    let idExpr = content.substring(pos + '.update({ where: { id: '.length, endOfId).trim();
    
    // Now we need to find the matching closing bracket for data: { ... }
    let dataStart = endOfId + ' }, data: '.length;
    let braceCount = 0;
    let dataEnd = -1;
    for (let i = dataStart; i < content.length; i++) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          // This is the end of the data object. But wait, is there a closing `})` ?
          let nextChars = content.substring(i + 1, i + 5).trim();
          if (nextChars.startsWith('}')) {
             // It means data wasn't just an object, or we found the closing of update({
             dataEnd = i + 1; // including the '}'
             break;
          }
        }
      }
    }
    
    if (dataEnd !== -1) {
      let dataExpr = content.substring(dataStart, dataEnd);
      // Replace the whole `.update({ where: { id: ID }, data: DATA })` with `.update(DATA).eq('id', ID)`
      let fullMatchStart = pos;
      let fullMatchEnd = content.indexOf(')', dataEnd) + 1;
      
      let replacement = `.update(${dataExpr}).eq('id', ${idExpr})`;
      content = content.substring(0, fullMatchStart) + replacement + content.substring(fullMatchEnd);
    }
    pos += 1;
  }
  
  // Replace .delete({ where: { id: ID } })
  pos = 0;
  while ((pos = content.indexOf('.delete({ where: { id: ', pos)) !== -1) {
    let endOfId = content.indexOf(' } })', pos);
    if (endOfId !== -1) {
      let idExpr = content.substring(pos + '.delete({ where: { id: '.length, endOfId).trim();
      let fullMatchStart = pos;
      let fullMatchEnd = endOfId + ' } })'.length;
      let replacement = `.delete().eq('id', ${idExpr})`;
      content = content.substring(0, fullMatchStart) + replacement + content.substring(fullMatchEnd);
    }
    pos += 1;
  }
  
  // Replace base44.entities.EntityName remaining
  for (const [entity, table] of Object.entries(ENTITY_TO_TABLE)) {
    const entityRegex = new RegExp(`base44\\.entities\\.${entity}`, 'g');
    content = content.replace(entityRegex, `supabase.from('${table}')`);
  }

  // Add auth replacements for AuthContext, Login, Register, ForgotPassword, ResetPassword
  content = content.replace(/base44\.auth\.loginViaEmailPassword\((.*?),\s*(.*?)\)/g, 'supabase.auth.signInWithPassword({ email: $1, password: $2 })');
  content = content.replace(/base44\.auth\.register\(\{(.*?)\}\)/g, 'supabase.auth.signUp({$1})');
  content = content.replace(/base44\.auth\.loginWithProvider\("google",\s*(.*?)\)/g, "supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + $1 } })");
  content = content.replace(/base44\.auth\.resetPasswordRequest\((.*?)\)/g, "supabase.auth.resetPasswordForEmail($1, { redirectTo: window.location.origin + '/reset-password' })");
  content = content.replace(/base44\.auth\.resetPassword\(\{\s*resetToken(.*?),\s*newPassword(.*?)\s*\}\)/g, "supabase.auth.updateUser({ password: newPassword })");
  content = content.replace(/base44\.auth\.verifyOtp\(\{\s*email(.*?),\s*otpCode(.*?)\s*\}\)/g, "supabase.auth.verifyOtp({ email$1, token: otpCode, type: 'signup' })");
  content = content.replace(/base44\.auth\.resendOtp\((.*?)\)/g, "supabase.auth.resend({ type: 'signup', email: $1 })");
  content = content.replace(/base44\.auth\.updateMe\(\{(.*?)\}\)/g, "supabase.auth.updateUser({ data: {$1} })");
  content = content.replace(/base44\.auth\.logout\((.*?)\)/g, "supabase.auth.signOut().then(() => { if($1) window.location.href = $1; else window.location.href='/login'; })");
  content = content.replace(/base44\.auth\.logout\(\)/g, "supabase.auth.signOut()");

  if (content !== originalContent) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${filepath}`);
  }
});
