import fs from 'node:fs';
import assert from 'node:assert/strict';
const s=JSON.parse(fs.readFileSync(new URL('../data/statistics.json',import.meta.url)));
const l=JSON.parse(fs.readFileSync(new URL('../data/lessons.json',import.meta.url)));
const ids=new Set([...s.sources,...l.sources].map(x=>x.id));
assert.equal(s.years.length,10);assert.deepEqual(s.years.map(x=>x.year),Array.from({length:10},(_,i)=>i+2016));
assert.ok(s.version&&s.checkedAt&&s.methodology.length);
for(const r of s.years)for(const k of ['cases','victims','lossNTD']){assert.ok(r[k]===null||(Number.isFinite(r[k])&&r[k]>=0),`${r.year} ${k} invalid`);if(r[k]!==null)assert.ok((r[k+'SourceIds']||r.sourceIds||[]).length,`${r.year} ${k} no source`);for(const id of r[k+'SourceIds']||r.sourceIds||[])assert.ok(ids.has(id),id);}
for(const row of s.typesByYear||[]){assert.ok(row.sourceIds.length);for(const id of row.sourceIds)assert.ok(ids.has(id));for(const k of ['cases','victims','lossNTD'])assert.ok(row[k]===null||Number.isFinite(row[k]));}for(const year of [2018,2021,2022,2023])assert.equal(s.typesByYear.filter(r=>r.year===year).reduce((n,r)=>n+r.cases,0),s.years.find(r=>r.year===year).cases,`method total ${year}`);
assert.equal(l.methods.length,14);assert.equal(l.quizzes.length,10);
for(const m of l.methods){assert.ok(m.title&&m.hook&&m.redFlags.length&&m.safeSteps.length);assert.ok(m.sourceIds.length);assert.ok(l.categories.some(c=>c.id===m.category));assert.equal(m.fictional,true);for(const id of m.sourceIds)assert.ok(ids.has(id));}
for(const q of l.quizzes){assert.ok(q.answerIndex>=0&&q.answerIndex<q.options.length);assert.ok(q.explanation&&q.sourceIds.length);assert.ok(l.methods.some(m=>m.id===q.methodId));for(const id of q.sourceIds)assert.ok(ids.has(id));}
for(const source of [...s.sources,...l.sources]){assert.ok(source.checkedAt&&source.title);assert.equal(new URL(source.url).protocol,'https:');}
const aggregate=JSON.parse(fs.readFileSync(new URL('../data/aggregate.json',import.meta.url)));assert.deepEqual(aggregate.statistics,s);assert.deepEqual(aggregate.education,l);
console.log(`PASS: 10 annual rows, 30 metric values/missing statuses, 14 methods, 10 quizzes, ${ids.size} source IDs, aggregate identity.`);
