// [INPUT] Temporary credential files and endpoint candidates. [OUTPUT] Transport boundary regressions.
// [POS] BeatGEO connection tests. [PROTOCOL] Synthetic credentials only; no external requests.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, chmod, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { endpoint, readToken } from '../../packages/dsh-geo/connection.mjs';
test('workspace credentials cannot be sent to remote hosts or credential-bearing URLs',()=>{
  assert.equal(endpoint('http://127.0.0.1:3141/api/mcp').port,'3141');
  for(const x of ['https://example.com/api/mcp','http://127.0.0.1.evil.test/api/mcp','http://user:pass@localhost/api/mcp','http://localhost/api/mcp?token=x','http://localhost/api/mcp#x','http://localhost/other'])assert.throws(()=>endpoint(x));
});
test('private-file rotation is observed and insecure or invalid material is refused',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'geo-credential-test-')),file=join(dir,'mcp.env');
  try{
    await writeFile(file,'BEAT_GEO_MCP_TOKEN=fixture-first\n',{mode:0o600});
    assert.equal(await readToken(file),'fixture-first');
    await writeFile(file,'BEAT_GEO_MCP_TOKEN=fixture-second\n');
    assert.equal(await readToken(file),'fixture-second');
    assert.equal(await readToken(file,'fixture-store'),'fixture-store');
    await symlink(file,join(dir,'link'));
    await assert.rejects(readToken(join(dir,'link')));
    if(process.platform!=='win32'){await chmod(file,0o644);await assert.rejects(readToken(file));await chmod(file,0o600);}
    await writeFile(file,'OTHER_KEY=fixture-value\n');await assert.rejects(readToken(file));
    await assert.rejects(readToken(file,'fixture\ninvalid'));
  }finally{await rm(dir,{recursive:true,force:true});}
});
