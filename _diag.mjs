async (page) => {
  const q = page.evaluate(async (query) => {
    const raw = localStorage.getItem('supabase.dashboard.auth.token');
    const token = JSON.parse(raw).access_token;
    const r = await fetch('https://api.supabase.com/v1/projects/zuqmulrrbrsctbjgqgwt/database/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ query })
    });
    return { status: r.status, body: await r.text() };
  });
  const table = await q("select tablename from pg_tables where schemaname='public' order by tablename;");
  const funcs = await q("select p.proname, p.proargtypes from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' order by p.proname;");
  const buckets = await q("select id, name from storage.buckets order by id;");
  const policies = await q("select count(*) as pol from pg_policies where schemaname='storage';");
  return JSON.stringify({ tables: JSON.parse(table.body), funcs: JSON.parse(funcs.body), buckets: JSON.parse(buckets.body), policies: JSON.parse(policies.body) }, null, 1);
}
