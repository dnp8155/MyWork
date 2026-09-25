const fs = require('fs');
const path = require('path');

const walk = function(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

const replaceInFile = (file, replacements) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [find, replace] of replacements) {
    if (content.includes(find)) {
      content = content.split(find).join(replace);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(file, content);
};

const replacements = [
  ['base44.auth.isAuthenticated().then((authed) => {', 'supabase.auth.getSession().then(({ data: { session: authed } }) => {'],
  ['base44.auth.setToken(result.access_token);', ''],
  ['const user = await base44.auth.me();', 'const { data: { user } } = await supabase.auth.getUser();'],
  ['base44.auth.me().then(setUser).catch(() => {});', 'supabase.auth.getUser().then(({ data: { user } }) => setUser(user)).catch(() => {});'],
  ['const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });', `const fileName = Math.random().toString(36).substring(2) + '_' + file.name;
      const { data: uploadData, error } = await supabase.storage.from('public').upload(fileName, file);
      if (error) throw error;
      const file_url = supabase.storage.from('public').getPublicUrl(fileName).data.publicUrl;`],
  ['const me = await base44.auth.me();', 'const { data: { user: me } } = await supabase.auth.getUser();'],
  ['try { await base44.users.inviteUser(form.email, "user"); } catch (err) { /* may already be registered */ }', '/* user invite via auth skipped */'],
  ["// Gate on the server's auth result, NOT base44.auth.isAuthenticated():", '// Gate on the server auth result'],
  ['await supabase.from(\'base44_accounts\').delete(a.id);', 'await supabase.from(\'base44_accounts\').delete().eq(\'id\', a.id);'],
  ['await supabase.from(\'base44_accounts\').update(account.id, form);', 'await supabase.from(\'base44_accounts\').update(form).eq(\'id\', account.id);']
];

walk('src', function(err, results) {
  if (err) throw err;
  const files = results.filter(f => f.endsWith('.jsx') || f.endsWith('.js'));
  files.forEach(f => replaceInFile(f, replacements));
  console.log('Fixed base44 references.');
});
