const fs = require('fs');

const replacements = [
  {
    file: 'src/pages/Settings.jsx',
    find: "supabase.from('company_settings').select('*').then((s) => setSettings(s[0] || null));",
    replace: "supabase.from('company_settings').select('*').then(({ data: s }) => setSettings(s?.[0] || null));"
  },
  {
    file: 'src/pages/Quotations.jsx',
    find: "const allProjects = await supabase.from('projects').select('*');",
    replace: "const { data: allProjects } = await supabase.from('projects').select('*');"
  },
  {
    file: 'src/pages/Quotations.jsx',
    find: "const existingInv = await supabase.from('invoices').select('*');",
    replace: "const { data: existingInv } = await supabase.from('invoices').select('*');"
  },
  {
    file: 'src/pages/ProjectDetail.jsx',
    find: "const existing = await supabase.from('payments').select('*');",
    replace: "const { data: existing } = await supabase.from('payments').select('*');"
  },
  {
    file: 'src/pages/ProjectDetail.jsx',
    find: "const existing = await supabase.from('expenses').select('*');",
    replace: "const { data: existing } = await supabase.from('expenses').select('*');"
  },
  {
    file: 'src/pages/Payments.jsx',
    find: "const allPayments = await supabase.from('payments').select('*');",
    replace: "const { data: allPayments } = await supabase.from('payments').select('*');"
  },
  {
    file: 'src/pages/Invoices.jsx',
    find: "const existing = await supabase.from('payments').select('*');",
    replace: "const { data: existing } = await supabase.from('payments').select('*');"
  }
];

for (const { file, find, replace } of replacements) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(find)) {
      fs.writeFileSync(file, content.replace(find, replace));
    }
  }
}
console.log('Fixed select() data destructing!');
