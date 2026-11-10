/**
 * [INPUT]: 公开编译/范围策略、固定描述符投影和 SDK 验证器
 * [OUTPUT]: 范围排除闭环、保留工具约束/身份不变及清晰用途的回归
 * [POS]: 发布元数据测试，不调用账户或业务端点
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import test from "node:test";
import assert from "node:assert/strict";
import { compileRemoteCatalog, createRemoteDispatcher, remoteCapabilityExclusions, resultTool, adaptRemoteNext } from "../scripts/remote-capabilities.mjs";
import { remotePresentation } from "../scripts/remote-presentation.mjs";
import { compactRemoteCatalog, schemaAssertions, reviseRemoteTools, shareRemoteExecutionGuidance, restrictRemoteTools } from "../scripts/remote-metadata.mjs";
import { remoteExecutionGuidance } from "../scripts/remote-presentation.mjs";
import { validateRemoteCatalog } from "../scripts/remote-preflight.mjs";

const contract=(reference,extra={})=>({reference,kind:reference.split(":")[0],title:reference.split(":")[1],description:"Test capability",readiness:"ready",schema_hash:"hash",input_schema:{type:"object",properties:{prompt:{type:"string",minLength:1}}},execution:{mode:"sync",executable:true,status_supported:false},...extra});

test("Xingtu creator research names preserve V1/V2 identifiers and unbounded integer selectors",()=>{
  const string={type:"string"};
  const cases=[
    ["douyin.xingtu.kol_rec_videos_v1","beatapi_douyin_get_creator_content_performance_v1",/content-performance data.*kolId.*not a general recommendation feed/,"kolId",{}],
    ["douyin.xingtu.kol_touch_distribution_v1","beatapi_douyin_get_connected_user_sources_v1",/source distribution.*kolId only/,"kolId",{}],
    ["douyin.xingtu_v2.get_author_commerce_spread_info","beatapi_douyin_get_creator_campaign_estimates",/CPM and CPE.*not guaranteed campaign outcomes/,"o_author_id",{}],
    ["douyin.xingtu_v2.get_author_touch_distribution","beatapi_douyin_get_creator_video_reach_distribution",/integer selectors.*V1 connected-user source/,"o_author_id",{platform_source:{type:"integer",default:1},platform_channel:{type:"integer",default:1}}],
  ];
  for(const [id,name,purpose,field,selectors]of cases){
    const input_schema={type:"object",additionalProperties:false,properties:{[field]:string,...selectors},required:[field]};
    const c=contract(`data:${id}`,{input_schema}),catalog=compileRemoteCatalog([c]),tool=catalog.tools[0],dispatch=createRemoteDispatcher(catalog);
    assert.equal(tool.name,name);assert.match(tool.description,purpose);assert.deepEqual(tool.inputSchema.properties.input,input_schema);
    assert.doesNotMatch(tool.description,/tikhub|guaranteed returns|your linked advertiser account|all data is public/i);
    const input={[field]:"creator-id"};assert.equal(dispatch(name,{input,idempotency_key:"xingtu-copy"}).reference,c.reference);
    assert.deepEqual(dispatch(name,{input,idempotency_key:"xingtu-copy"}).input,input);
    assert.throws(()=>dispatch(name,{input:{},idempotency_key:"xingtu-copy"}));
    assert.throws(()=>dispatch(name,{input:{[field==="kolId"?"o_author_id":"kolId"]:"creator-id"},idempotency_key:"xingtu-copy"}));
    if(Object.keys(selectors).length){
      for(const value of [1,7]){const chosen={...input,platform_source:value,platform_channel:value};assert.deepEqual(dispatch(name,{input:chosen,idempotency_key:"xingtu-copy"}).input,chosen);}
      assert.throws(()=>dispatch(name,{input:{...input,platform_source:"1"},idempotency_key:"xingtu-copy"}));
    }else assert.throws(()=>dispatch(name,{input:{...input,platform_source:1},idempotency_key:"xingtu-copy"}));
  }
});

test("Douyin playback links, share-code resolution and QR generation retain their distinct contracts",()=>{
  const text={type:"string"};
  const cases=[
    ["fetch_multi_video_high_quality_play_url","beatapi_douyin_get_original_video_playback_urls",/comma-separated.*one string, not an array/, {aweme_ids:{...text,default:"7512756548356492544,7448118827402972455,7126745726494821640"},region:{anyOf:[text,{type:"null"}]}},[],[{aweme_ids:"123,456",region:"CN"},{aweme_ids:"123",region:null},{}],{aweme_ids:["123","456"]}],
    ["fetch_video_high_quality_play_url","beatapi_douyin_get_original_video_playback_url",/Prefer aweme_id; use share_url.*not a search market/, {aweme_id:text,share_url:text,region:text},[],[{aweme_id:"123",region:"HK"},{share_url:"https://www.douyin.com/video/123"},{}],{aweme_id:123}],
    ["fetch_share_info_by_share_code","beatapi_douyin_resolve_share_code",/content-sharing code.*separate call/, {share_code:text},["share_code"],[{share_code:"copied article share code"}],{}],
    ["generate_douyin_video_share_qrcode","beatapi_douyin_generate_share_qr_code",/video ID or author UID.*not a new video, login QR code/, {object_id:text},["object_id"],[{object_id:"video-id"},{object_id:"author-uid"}],{}],
  ];
  for(const [id,name,purpose,properties,required,inputs,bad] of cases){
    const input_schema={type:"object",additionalProperties:false,properties,...(required.length?{required}:{})};
    const c=contract(`data:douyin.app.v3.${id}`,{input_schema}),catalog=compileRemoteCatalog([c]),tool=catalog.tools[0],dispatch=createRemoteDispatcher(catalog);
    assert.equal(tool.name,name);assert.match(tool.description,purpose);
    assert.doesNotMatch(tool.description,/tikhub|watermark-free|guaranteed|copyright bypass|uncompressed/i);
    assert.deepEqual(tool.inputSchema.properties.input,input_schema);
    for(const input of inputs){const run=dispatch(name,{input,idempotency_key:"douyin-media-copy"});assert.equal(run.reference,c.reference);assert.deepEqual(run.input,input);}
    assert.throws(()=>dispatch(name,{input:bad,idempotency_key:"douyin-media-copy"}));
    assert.throws(()=>dispatch(name,{input:{...inputs[0],hidden:true},idempotency_key:"douyin-media-copy"}));
  }
});

test("six reviewed tools clarify ranking/search/highlight semantics without coercing inputs",()=>{
  const string={type:"string"};
  const cases=[
    ["bilibili.huahuo.popular_avid_list","beatapi_bilibili_get_video_rankings",/industry name.*not an industry ID/, {category:{...string,default:""},page:{type:"integer",minimum:1,default:1}},[],{category:"industry",page:2},{page:0}],
    ["lemon8.app.fetch_search","beatapi_data_lemon8_app_fetch_search_1ea8f53148",/article \(Posts\).*max_cursor/, {query:string,search_tab:{...string,default:"main"},max_cursor:{...string,default:""}},["query"],{query:"design",search_tab:"article",max_cursor:"next"},{query:"design",max_cursor:1}],
    ["pipixia.app.fetch_search","beatapi_data_pipixia_app_fetch_search_b4c3830209",/search_type is a string.*offset is a string cursor/, {keyword:string,search_type:{...string,default:"1"},offset:{...string,default:"0"}},["keyword"],{keyword:"design",search_type:"5",offset:"20"},{keyword:"design",search_type:5}],
    ["xiaohongshu.pgy.get_content_square","beatapi_xiaohongshu_get_content_rankings",/board-specific filters.*not an action to launch ads/, {biz_type:{type:"integer",enum:[1,2,3,4,5,6,7,8]},date_range:{type:"integer",enum:[3,7,14,30],default:7},page_size:{type:"integer",minimum:1,maximum:34,default:34},fans:{anyOf:[{type:"object",additionalProperties:false,properties:{min:{anyOf:[{type:"integer",minimum:0,maximum:9999999},{type:"null"}]}}},{type:"null"}]}},["biz_type"],{biz_type:4,date_range:14,page_size:34,fans:{min:null}},{biz_type:4,page_size:35}],
    ["zhihu.web.fetch_salt_search_v3","beatapi_zhihu_search_yanxuan_content",/search results, not a full-text download/, {keyword:string,limit:{...string,default:"20"},offset:{...string,default:"0"},search_hash_id:{...string,default:""}},["keyword"],{keyword:"design",limit:"20",offset:"0"},{keyword:"design",limit:20}],
    ["zhihu.web.fetch_user_segments","beatapi_zhihu_get_user_highlights",/member hash ID, not the profile URL token.*not demographic audience segments/, {user_url_token:string,content_type:{...string,default:"all"},limit:{...string,default:"20"},offset:{...string,default:"0"}},["user_url_token"],{user_url_token:"c72367",content_type:"all",offset:"0"},{user_url_token:"c72367",offset:0}],
  ];
  for(const [id,name,purpose,properties,required,input,bad] of cases){
    const input_schema={type:"object",additionalProperties:false,properties,required};
    const c=contract(`data:${id}`,{input_schema}),catalog=compileRemoteCatalog([c]),tool=catalog.tools[0],dispatch=createRemoteDispatcher(catalog);
    assert.equal(tool.name,name);assert.match(tool.description,purpose);
    assert.doesNotMatch(tool.description,/tikhub|guaranteed|all highlights are public/i);
    assert.deepEqual(tool.inputSchema.properties.input,input_schema);
    assert.equal(catalog.bindings[name].reference,c.reference);
    assert.deepEqual(dispatch(name,{input,idempotency_key:"six-copy-test"}).input,input);
    assert.throws(()=>dispatch(name,{input:bad,idempotency_key:"six-copy-test"}));
    assert.throws(()=>dispatch(name,{input:{...input,hidden:true},idempotency_key:"six-copy-test"}));
    assert.throws(()=>dispatch(name,{input,idempotency_key:""}));
  }
});

test("reviewed research names distinguish purpose while preserving every schema and execution binding",()=>{
  const cases=[
    ["douyin.app.v3.fetch_brand_hot_search_list","beatapi_douyin_list_brand_trend_categories",/categor/],
    ["douyin.app.v3.fetch_brand_hot_search_list_detail","beatapi_douyin_get_brand_trends_by_category",/category_id/],
    ["douyin.billboard.fetch_hot_account_fans_interest_topic_list","beatapi_douyin_get_audience_interest_topics",/topics/],
    ["douyin.billboard.fetch_hot_account_fans_portrait_list","beatapi_douyin_get_audience_profile_breakdown",/option/],
    ["douyin.billboard.fetch_hot_account_fans_interest_account_list","beatapi_douyin_get_audience_interest_creators",/creators/],
    ["douyin.billboard.fetch_hot_account_fans_interest_search_list","beatapi_douyin_get_audience_search_terms",/search terms/],
    ["douyin.billboard.fetch_hot_total_hot_word_detail_list","beatapi_douyin_get_trending_content_term_details",/query_day/],
    ["douyin.billboard.fetch_hot_total_hot_word_list","beatapi_douyin_list_trending_content_terms",/date_window/],
    ["douyin.creator.fetch_creator_material_center_billboard","beatapi_douyin_get_creator_center_video_rankings",/order_key/],
    ["douyin.creator.fetch_creator_material_center_related","beatapi_douyin_get_related_creator_materials",/query_id/],
    ["douyin.creator.fetch_creator_material_center_config","beatapi_douyin_get_creator_center_filter_config",/filter/],
    ["youtube.web.search_channel","beatapi_data_youtube_web_search_channel_cb0c42445e",/channel_id.*search_query/],
  ];
  const input_schema={type:"object",additionalProperties:false,properties:{query:{type:"string",minLength:1},limit:{type:"integer",minimum:1,maximum:50,default:10}},required:["query"],allOf:[{if:{required:["limit"]},then:{required:["query"]}}]};
  for(const [id,name,purpose] of cases){
    const c=contract(`data:${id}`,{input_schema}),tool=compileRemoteCatalog([c]).tools[0];
    assert.equal(tool.name,name);assert.match(tool.title,/^(List|Get|Search) /);assert.match(tool.description,purpose);
    assert.doesNotMatch(tool.description,/tikhub|guaranteed|individual search histor/i);
    assert.deepEqual(tool.inputSchema.properties.input,input_schema);
    const catalog=compileRemoteCatalog([c]),dispatch=createRemoteDispatcher(catalog),input={query:"research",limit:5};
    assert.deepEqual(catalog.bindings[name],{reference:c.reference,operation:"start",schemaHash:"hash",mode:"sync",statusSupported:false});
    assert.deepEqual(dispatch(name,{input,idempotency_key:"review-name-test"}).input,input);
    for(const bad of [{},{query:""},{query:"research",limit:51},{query:"research",hidden:true}])assert.throws(()=>dispatch(name,{input:bad,idempotency_key:"review-name-test"}));
  }
});

test("approved public scope removes fixed tools and retrieval references without rebuilding other descriptors",()=>{
  const source=compileRemoteCatalog([contract("data:kept"),contract("data:legacy-a"),contract("data:legacy-b")]);
  const replacements={"data:legacy-a":"data:tiktok.web.device_register","data:legacy-b":"data:bilibili.huahuo.dmp_pkg_list"};
  for(const binding of Object.values(source.bindings))binding.reference=replacements[binding.reference]??binding.reference;
  for(const tool of source.tools){
    const binding=tool._meta?.["beatapi/capability"];
    if(binding)binding.reference=replacements[binding.reference]??binding.reference;
    else tool.inputSchema.properties.reference.enum=tool.inputSchema.properties.reference.enum.map(r=>replacements[r]??r);
  }
  source.tools.find(t=>t.name===resultTool).inputSchema.properties.reference.enum.push("data:historical-reader-value");
  const before=structuredClone(source),tools=restrictRemoteTools(source.tools),kept=source.tools.find(t=>t._meta?.["beatapi/capability"]?.reference==="data:kept");
  assert.deepEqual(source,before);assert.deepEqual(restrictRemoteTools(tools),tools);
  assert.deepEqual(tools.find(t=>t.name===kept.name),kept);
  assert.deepEqual(tools.find(t=>t.name===resultTool).inputSchema.properties.reference.enum,["data:kept","data:historical-reader-value"]);
  const bindings=Object.fromEntries(Object.entries(source.bindings).filter(([name])=>tools.some(t=>t.name===name)));
  const catalog={...source,tools,bindings},dispatch=createRemoteDispatcher(catalog);validateRemoteCatalog(catalog);
  for(const reference of Object.values(replacements)){
    const removed=source.tools.find(t=>t._meta?.["beatapi/capability"]?.reference===reference);
    assert.throws(()=>dispatch(removed.name,{input:{prompt:"test"},idempotency_key:"scope-test"}),/not exposed/);
    assert.throws(()=>dispatch(resultTool,{reference,request_id:"owned-result"}),/Invalid tool arguments/);
    assert.equal(adaptRemoteNext(catalog,{next:{call:{tool:"capabilities_run",arguments:{reference}}}}).next.action,"none");
  }
  assert.equal(dispatch(kept.name,{input:{prompt:"test"},idempotency_key:"scope-test"}).reference,"data:kept");
});

test("Douyin rate and rising-popularity rankings retain pagination, defaults and structured tag inputs",()=>{
  const integer={type:"integer"},text={type:"string"};
  const tags={type:"array",items:{type:"object",properties:{value:{anyOf:[integer,{type:"null"}]},children:{anyOf:[{type:"array",items:{type:"object",properties:{value:{anyOf:[integer,{type:"null"}]}}}},{type:"null"}]}}}};
  const cases=[
    ["fan","beatapi_douyin_get_follower_growth_rate_rankings",/follower-growth rate/,"page"],
    ["like","beatapi_douyin_get_like_rate_rankings",/like rate, not total like count/,"page"],
    ["search","beatapi_douyin_get_rising_search_rankings",/search-popularity ranking, not general video search/,"page_num"],
    ["topic","beatapi_douyin_get_rising_topic_rankings",/topic ranking, not posts matching a topic/,"page"],
  ];
  for(const [id,name,purpose,page] of cases){
    const properties={date_window:{...integer,default:24},keyword:{...text,default:id==="search"?"抖音":""},[page]:{...integer,default:1},page_size:{...integer,default:10},...(id==="search"?{}:{tags})};
    const input_schema={type:"object",additionalProperties:false,properties};
    const reference=`data:douyin.billboard.fetch_hot_total_high_${id}_list`;
    const catalog=compileRemoteCatalog([contract(reference,{input_schema})]),tool=catalog.tools[0],dispatch=createRemoteDispatcher(catalog);
    assert.equal(tool.name,name);assert.match(tool.description,purpose);assert.match(tool.description,/hours/);
    assert.deepEqual(tool.inputSchema.properties.input,input_schema);
    assert.equal(tool.inputSchema.properties.input.properties.date_window.enum,undefined);
    const input={date_window:13,keyword:"",[page]:2,page_size:10,...(id==="search"?{}:{tags:[{value:null,children:[{value:62808}]},{value:628,children:null}]})};
    for(const value of [{},input]){const run=dispatch(name,{input:value,idempotency_key:"ranking-names"});assert.equal(run.reference,reference);assert.deepEqual(run.input,value);}
    assert.throws(()=>dispatch(name,{input:{[page]:"2"},idempotency_key:"ranking-names"}));
    assert.throws(()=>dispatch(name,{input:{[page==="page"?"page_num":"page"]:2},idempotency_key:"ranking-names"}));
    if(id==="search")assert.throws(()=>dispatch(name,{input:{tags:[]},idempotency_key:"ranking-names"}));
    assert.doesNotMatch(tool.description,/tikhub|guaranteed|real-time|individual identities/i);
  }
});

test("Instagram V2/V3 search copy distinguishes result types and cursor contracts without coercion",()=>{
  const text={type:"string"};
  const cases=[
    ["v2","beatapi_data_instagram_v2_general_search_290a8f25e9",{keyword:text,pagination_token:text},"keyword",/users, posts and Reels.*keyword.*Omit pagination_token/,/not the V3 query, next_max_id or rank_token/,[{keyword:"design"},{keyword:"design",pagination_token:"next"},{keyword:""}],{keyword:"design",pagination_token:1}],
    ["v3","beatapi_data_instagram_v3_general_search_56ca73e24a",{query:text,next_max_id:text,rank_token:text,enable_metadata:{type:"boolean",default:true}},"query",/user, hashtag and place.*#fashion.*reuse both returned values/,/defaults to true.*duplicates/,[{query:"#fashion"},{query:"design",next_max_id:"next",rank_token:"rank",enable_metadata:false},{query:"",enable_metadata:true}],{query:"design",enable_metadata:"false"}],
  ];
  for(const [version,name,properties,field,purpose,pagination,inputs,bad] of cases){
    const input_schema={type:"object",additionalProperties:false,properties,required:[field]};
    const c=contract(`data:instagram.${version}.general_search`,{input_schema});
    const catalog=compileRemoteCatalog([c]),tool=catalog.tools[0],dispatch=createRemoteDispatcher(catalog);
    assert.equal(tool.name,name);assert.match(tool.title,new RegExp(version.toUpperCase()+"$"));
    assert.match(tool.description,purpose);assert.match(tool.description,pagination);
    assert.doesNotMatch(tool.description,/tikhub|guaranteed|all results|private account access/i);
    assert.deepEqual(tool.inputSchema.properties.input,input_schema);
    for(const input of inputs){const result=dispatch(name,{input,idempotency_key:"instagram-version-copy"});assert.equal(result.reference,c.reference);assert.deepEqual(result.input,input);}
    assert.throws(()=>dispatch(name,{input:bad,idempotency_key:"instagram-version-copy"}));
    assert.throws(()=>dispatch(name,{input:{},idempotency_key:"instagram-version-copy"}));
    assert.throws(()=>dispatch(name,{input:{...inputs[0],select:"users"},idempotency_key:"instagram-version-copy"}));
  }
});

test("Instagram entity search describes every selector without changing omission or accepted inputs",()=>{
  const input_schema={type:"object",additionalProperties:false,properties:{query:{type:"string"},select:{type:"string"}},required:["query"]};
  const catalog=compileRemoteCatalog([contract("data:instagram.fetch_search",{input_schema})]),tool=catalog.tools[0],dispatch=createRemoteDispatcher(catalog);
  assert.equal(tool.name,"beatapi_data_instagram_fetch_search_ceb898a205");
  assert.equal(tool.title,"Search Instagram Users, Hashtags and Places");
  assert.match(tool.description,/select to users, hashtags or places/);
  assert.match(tool.description,/omit select for mixed-type results/);
  assert.match(tool.description,/not post or Reel search/);
  assert.deepEqual(tool.inputSchema.properties.input,input_schema);
  for(const select of [undefined,"users","hashtags","places","future-type"]){
    const input={query:"example",...(select===undefined?{}:{select})};
    const execution=dispatch(tool.name,{input,idempotency_key:"instagram-copy-test"});
    assert.equal(execution.reference,"data:instagram.fetch_search");assert.deepEqual(execution.input,input);
  }
  assert.throws(()=>dispatch(tool.name,{input:{select:"users"},idempotency_key:"instagram-copy-test"}));
  assert.doesNotMatch(tool.description,/tikhub|guaranteed|private account access/i);
});

test("index latest dates retain no-input semantics and excluded audience copy remains truthful",()=>{
  assert.match(remotePresentation["data:bilibili.huahuo.dmp_pkg_list"].description,/advertiser context.*no account selector/);
  const cases=[
    ["data:douyin.index.fetch_all_valid_date","beatapi_data_douyin_index_fetch_all_valid_date_d6262c8c8f","Get Douyin Index Latest Available Dates",/latest available daily, weekly and monthly dates/,/not a full calendar/],
  ];
  for(const [reference,name,title,context,purpose] of cases){
    const input_schema={type:"object",additionalProperties:false,properties:{}};
    const catalog=compileRemoteCatalog([contract(reference,{input_schema})]),tool=catalog.tools[0],dispatch=createRemoteDispatcher(catalog);
    assert.equal(tool.name,name);assert.equal(tool.title,title);
    assert.match(tool.description,context);assert.match(tool.description,purpose);
    assert.doesNotMatch(tool.description,/tikhub|all packages are public|your linked Bilibili account|YYYY-MM-DD|guaranteed/i);
    assert.deepEqual(tool.inputSchema.properties.input,input_schema);
    assert.equal(dispatch(name,{input:{},idempotency_key:"context-copy-test"}).reference,reference);
    assert.throws(()=>dispatch(name,{input:{account_id:"123",date:"2026-11-09"},idempotency_key:"context-copy-test"}));
  }
});

test("Douyin short-link generation explains direction and preserves target_url schema and binding",()=>{
  const input_schema={type:"object",additionalProperties:false,properties:{target_url:{type:"string",description:"Target URL to be converted"}},required:["target_url"]};
  const catalog=compileRemoteCatalog([contract("data:douyin.web.handler_shorten_url",{input_schema})]),tool=catalog.tools[0],dispatch=createRemoteDispatcher(catalog);
  assert.equal(tool.name,"beatapi_data_douyin_web_handler_shorten_url_78532ede50");
  assert.equal(tool.title,"Generate Douyin Short Link");
  assert.match(tool.description,/target_url/);
  assert.match(tool.description,/link shortening, not expanding short links/);
  assert.match(tool.description,/does not publish content or send the link/);
  assert.doesNotMatch(tool.description,/tikhub|tracking|expires|permanent|guaranteed/i);
  assert.deepEqual(tool.inputSchema.properties.input,input_schema);
  for(const target_url of ["https://www.douyin.com/video/123?from=test",""]){
    assert.equal(dispatch(tool.name,{input:{target_url},idempotency_key:"short-link-copy-test"}).reference,"data:douyin.web.handler_shorten_url");
  }
  for(const input of [{},{target_url:123},{url:"https://www.douyin.com/video/123"}]){
    assert.throws(()=>dispatch(tool.name,{input,idempotency_key:"short-link-copy-test"}));
  }
});

test("text model display titles express the action without changing literal model IDs or descriptions",()=>{
  for(const id of ["claude-fable-5-1","deepseek-v4.1-flash-free","future-route-2027"]){
    const c=contract(`model:${id}`,{categories:["text"],input_schema:{type:"object",properties:{input:{type:"string"},instructions:{type:"string"}}}});
    const tool=compileRemoteCatalog([c]).tools[0];
    assert.equal(tool.title,`Generate Text with ${id}`);
    assert.match(tool.name,/^beatapi_generate_text_/);
    assert.ok(tool.description.startsWith(`Generate text with ${id} using`));
    assert.doesNotMatch(tool.description,/with Generate Text|free of charge|official/i);
    const revised=reviseRemoteTools([tool],[c])[0];
    assert.deepEqual(revised,tool);
    assert.equal(createRemoteDispatcher({tools:[tool],bindings:{[tool.name]:tool._meta["beatapi/capability"]}})(tool.name,{input:{input:"test"},idempotency_key:"title-only-test"}).reference,c.reference);
  }
  assert.equal(compileRemoteCatalog([contract("data:example.lookup")]).tools[0].title,"example.lookup");
  assert.equal(compileRemoteCatalog([contract("model:image-route",{categories:["image"]})]).tools[0].title,"image-route");
});

test("Bilibili creator rankings and available periods have explicit names and unchanged contracts",()=>{
  const cases=[
    ["data:bilibili.huahuo.popular_up_x_huo","beatapi_bilibili_get_industry_creator_rankings",{type:"object",additionalProperties:false,properties:{x_huo_industry_id:{type:"integer"},rank_date_type:{type:"integer",default:1},rank_date:{anyOf:[{type:"string"},{type:"null"}]},page:{type:"integer",minimum:1,default:1}},required:["x_huo_industry_id"]},/Get Bilibili Industry Creator Rankings/,/selected industry.*monthly or quarterly/],
    ["data:bilibili.huahuo.x_huo_date_options","beatapi_bilibili_list_creator_ranking_periods",{type:"object",additionalProperties:false,properties:{rank_date_type:{type:"integer",default:1}}},/List Bilibili Creator Ranking Periods/,/completed.*YYYY-MM/],
  ];
  for(const [reference,name,input_schema,title,description] of cases){
    const catalog=compileRemoteCatalog([contract(reference,{input_schema})]),tool=catalog.tools[0];
    assert.equal(tool.name,name);assert.match(tool.title,title);assert.match(tool.description,description);
    assert.deepEqual(schemaAssertions(tool.inputSchema.properties.input),schemaAssertions(input_schema));
    assert.equal(tool.inputSchema.properties.input.properties.rank_date_type.enum,undefined);
    const input=reference.endsWith("popular_up_x_huo")?{x_huo_industry_id:7,rank_date_type:2,rank_date:null,page:1}:{};
    assert.equal(createRemoteDispatcher(catalog)(name,{input,idempotency_key:"ranking-copy-test"}).reference,reference);
    assert.doesNotMatch(tool.description,/tikhub|real.time|guaranteed/i);
  }
});

test("Douyin connection data copy identifies the creator ID without inventing undocumented audience fields",()=>{
  const input_schema={type:"object",additionalProperties:false,properties:{kolId:{type:"string"}},required:["kolId"]};
  const catalog=compileRemoteCatalog([contract("data:douyin.xingtu.kol_link_struct_v1",{input_schema})]),tool=catalog.tools[0];
  assert.equal(tool.name,"beatapi_douyin_get_creator_linked_user_structure");
  assert.match(tool.title,/Get Douyin Creator Connected-User Data/);
  assert.match(tool.description,/Xingtu creator ID/);
  assert.match(tool.description,/fields actually returned/);
  assert.doesNotMatch(tool.description,/\b(age|gender|phone|email)\b|enterprise account|tikhub/i);
  assert.deepEqual(schemaAssertions(tool.inputSchema.properties.input),schemaAssertions(input_schema));
  assert.equal(createRemoteDispatcher(catalog)(tool.name,{input:{kolId:"123"},idempotency_key:"creator-copy-test"}).reference,"data:douyin.xingtu.kol_link_struct_v1");
});

test("verified high-cache display labels do not rename model tools or add cache/concurrency inputs",()=>{
  for(const [id,name] of [["deepseek-v4.1-flash-hc","beatapi_generate_text_deepseek_v4_1_flash_hc_2c64bd66"],["deepseek-v4-pro-0813-hc","beatapi_generate_text_deepseek_v4_pro_0813_hc_1a30d1b2"]]){
    const input_schema={type:"object",additionalProperties:false,properties:{input:{type:"string",minLength:1},temperature:{type:"number",minimum:0,maximum:2}},required:["input"]};
    const catalog=compileRemoteCatalog([contract(`model:${id}`,{categories:["text"],input_schema})]);
    const tool=catalog.tools[0];
    assert.equal(tool.name,name);
    assert.match(tool.title,/Generate Text.*High-Cache/);
    assert.match(tool.description,/HC means high-cache/);
    assert.match(tool.description,/cache hits are not guaranteed/i);
    assert.doesNotMatch(tool.description,/high.concurrency|high.context|guaranteed savings|tikhub/i);
    assert.deepEqual(schemaAssertions(tool.inputSchema.properties.input),schemaAssertions(input_schema));
    assert.equal(createRemoteDispatcher(catalog)(name,{input:{input:"Summarize supplied text",temperature:0},idempotency_key:"hc-metadata-test"}).reference,`model:${id}`);
  }
});

test("X trends explains the country selector without changing accepted values or defaults",()=>{
  const input_schema={type:"object",additionalProperties:false,properties:{country:{type:"string",default:"UnitedStates"}}};
  const catalog=compileRemoteCatalog([contract("data:twitter.web.fetch_trending",{input_schema})]);
  const tool=catalog.tools[0];
  assert.equal(tool.name,"beatapi_data_twitter_web_fetch_trending_18992394a0");
  assert.equal(tool.title,"X Trending Topics by Country");
  assert.match(tool.description,/country.*UnitedStates/);
  assert.match(tool.description,/single trends lookup/);
  assert.doesNotMatch(tool.description,/tikhub|real.time|guaranteed/i);
  assert.deepEqual(schemaAssertions(tool.inputSchema.properties.input),schemaAssertions(input_schema));
  for(const input of [{},{country:"Japan"},{country:"UnitedStates"}])assert.equal(createRemoteDispatcher(catalog)(tool.name,{input,idempotency_key:"trends-metadata-test"}).reference,"data:twitter.web.fetch_trending");
});

test("reviewed data utilities explain actual outputs without changing capability or accepted parameters",()=>{
  assert.match(remotePresentation["data:tiktok.web.device_register"].description,/guest device ID and guest Cookie/);
  const cases=[
    ["data:tiktok.web.fetch_live_im_fetch",{type:"object",properties:{room_id:{type:"string"},user_unique_id:{type:"string"},resp_content_type:{type:"string",default:"protobuf"}},required:["room_id"]},{room_id:"123",user_unique_id:"viewer",resp_content_type:"json"},/single parameter fetch/,"beatapi_tiktok_get_live_comment_parameters"],
    ["data:weibo.web_v2.fetch_all_groups",{type:"object",properties:{}},{},/group IDs, names and container IDs/,undefined],
  ];
  for(const [reference,input_schema,input,description,name] of cases){
    const schema={additionalProperties:false,...input_schema};
    const source=compileRemoteCatalog([contract(reference,{input_schema:schema})]);
    const tool=source.tools.find(t=>t._meta?.["beatapi/capability"]?.reference===reference);
    assert.match(tool.description,description);
    if(name)assert.equal(tool.name,name);
    assert.doesNotMatch(tool.description,/TikHub|tikhub\.io|upstream/i);
    assert.deepEqual(schemaAssertions(tool.inputSchema.properties.input),schemaAssertions(schema));
    assert.equal(createRemoteDispatcher(source)(tool.name,{input,idempotency_key:"metadata-audit"}).reference,reference);
    if(reference.includes("all_groups"))assert.match(tool.description,/does not select or link a Weibo account/);
    if(reference.includes("live_im_fetch")){
      assert.equal(tool.inputSchema.properties.input.properties.resp_content_type.default,"protobuf");
      assert.equal(tool.inputSchema.properties.input.properties.resp_content_type.enum,undefined);
    }
  }
});

test("shared execution guidance is lossless, explicit, idempotent and validated",()=>{
  const catalog=compileRemoteCatalog([contract("model:future-image",{categories:["image"]})]);
  catalog.instructions="Existing server guidance.";
  const before=structuredClone(catalog),shared=shareRemoteExecutionGuidance(catalog);
  assert.deepEqual(catalog,before);
  assert.equal(shared.instructions,"Existing server guidance.\n"+remoteExecutionGuidance);
  for(const [i,tool] of shared.tools.entries()){
    const old=catalog.tools[i];
    assert.deepEqual({...tool,description:old.description},old);
    if(tool._meta["beatapi/capability"])assert.equal(tool.description+" "+remoteExecutionGuidance,old.description);
    else assert.equal(tool.description,old.description);
  }
  assert.deepEqual(shareRemoteExecutionGuidance(shared),shared);
  validateRemoteCatalog(shared);
  const invalid=structuredClone(catalog);invalid.tools[0].description="Missing execution guidance";
  assert.throws(()=>shareRemoteExecutionGuidance(invalid),/Missing execution guidance/);
});

test("presentation names are explicit, unique and bound to the same references",()=>{
  const entries=Object.entries(remotePresentation).filter(([reference])=>!Object.hasOwn(remoteCapabilityExclusions,reference));
  const catalog=compileRemoteCatalog(entries.map(([ref])=>contract(ref)));
  assert.equal(Object.keys(catalog.bindings).length,entries.length);
  for(const [ref,presentation] of entries){
    const tool=catalog.tools.find(t=>catalog.bindings[t.name]?.reference===ref);
    if(presentation.name)assert.equal(tool.name,presentation.name);
    assert.equal(tool.title,presentation.title);
    assert.match(tool.description,/Uses connected BeatAPI balance/);
    assert.ok(tool.name.length<=64);
    assert.equal(createRemoteDispatcher(catalog)(tool.name,{input:{prompt:"test"},idempotency_key:"test"}).reference,ref);
  }
  assert.equal(new Set(catalog.tools.map(t=>t.name)).size,catalog.tools.length);
});

test("model summaries derive modality and supported references from the contract, not model-specific branches",()=>{
  for(const category of ["image","video","text","decision","moderation"]){
    const c=contract(`model:future-${category}`,{
      title:`Future ${category}`,categories:[category],description:"Generic generation capability",
      execution:{mode:category==="video"||category==="image"?"async":"sync",executable:true,status_supported:true},
      input_schema:{type:"object",properties:{prompt:{type:"string"},images:{type:"array",items:{type:"string"}},reference_videos:{type:"array",items:{type:"string"}}}},
    });
    const tool=compileRemoteCatalog([c]).tools[0];
    assert.match(tool.name,/^beatapi_(generate_(images|video|text)|evaluate_decision|moderate_content)_/);
    assert.match(tool.description,new RegExp(category==="moderation"?"moderate":category));
    assert.doesNotMatch(tool.description,/generation capability|next-generation|significantly enhanced/);
  }
});

test("image moderation never advertises text-only operation",()=>{
  const c=contract("model:future-image-moderation",{categories:["moderation"],input_schema:{type:"object",required:["image_url"],properties:{image_url:{type:"string"},input:{type:"string"}}}});
  const tool=compileRemoteCatalog([c]).tools[0];
  assert.match(tool.description,/image inputs and optional accompanying text/);
  assert.doesNotMatch(tool.description,/text or|supplied text/);
  assert.deepEqual(tool.inputSchema.properties.input.required,["image_url"]);
});

test("refreshing published descriptors preserves runtime-inserted annotations and retrieval enums verbatim",()=>{
  const c=contract("data:tiktok.web.get_aweme_id");
  const source=compileRemoteCatalog([c]).tools;
  source[0].annotations.idempotentHint=false;
  source.push({name:"read_legacy_result",inputSchema:{type:"object",properties:{reference:{enum:[c.reference,"data:legacy-result"]}}}});
  const before=structuredClone(source),after=reviseRemoteTools(source,[c]);
  assert.deepEqual(source,before);
  assert.equal(after[0].name,"beatapi_tiktok_extract_video_id");
  for(const key of ["inputSchema","outputSchema","annotations","securitySchemes","_meta"])assert.deepEqual(after[0][key],before[0][key]);
  assert.deepEqual(after.at(-1),before.at(-1));
  assert.throws(()=>reviseRemoteTools(source,[]),/Missing presentation contract/);
  assert.throws(()=>reviseRemoteTools(source,[{...c,schema_hash:"different"}]),/contract version mismatch/);
});

test("compact projection changes annotations only, preserves defaults, extension rules and payload fields named examples",()=>{
  const schema={type:"object",additionalProperties:false,required:["mode","duration"],properties:{mode:{type:"string",enum:["text","image"],default:"text",description:"Generation mode",examples:["text"]},duration:{type:"integer",minimum:1,maximum:8,default:8},examples:{type:"string",minLength:2},data:{const:{examples:[1],description:"payload"}}},allOf:[{if:{properties:{mode:{const:"image"}}},then:{required:["examples"]}}],"x-beatapi-rules":{fields:{duration:{unit:"seconds"}}}};
  const original=compileRemoteCatalog([contract("model:future-video",{input_schema:schema,categories:["video"]})]);
  const before=structuredClone(original),compact=compactRemoteCatalog(original);
  assert.deepEqual(original,before);
  assert.deepEqual(compact.bindings,original.bindings);
  for(const tool of compact.tools){
    const source=original.tools.find(t=>t.name===tool.name);
    assert.deepEqual(schemaAssertions(tool.inputSchema),schemaAssertions(source.inputSchema));
    assert.deepEqual(schemaAssertions(tool.outputSchema),schemaAssertions(source.outputSchema));
    assert.deepEqual(tool._meta,source._meta);
    assert.deepEqual(tool.annotations,source.annotations);
    assert.deepEqual(tool.securitySchemes,source.securitySchemes);
  }
  const input=compact.tools[0].inputSchema.properties.input;
  assert.equal(input.properties.mode.description,"Generation mode");
  assert.equal(input.properties.mode.default,"text");
  assert.equal(input.properties.mode.examples,undefined);
  assert.ok(input.properties.examples);
  assert.deepEqual(input.properties.data.const,{examples:[1],description:"payload"});
  validateRemoteCatalog(compact);
  const name=compact.tools[0].name,a=createRemoteDispatcher(original),b=createRemoteDispatcher(compact);
  for(const input of [{mode:"text",duration:8},{mode:"image",duration:8,examples:"ok"},{mode:"image",duration:8},{mode:"text",duration:9},{mode:"bad",duration:8}]){
    const args={input,idempotency_key:"same"};
    let left,right;try{left=a(name,args);}catch{left="rejected";}try{right=b(name,args);}catch{right="rejected";}
    assert.deepEqual(left,right);
  }
  compact.tools[0].outputSchema.additionalProperties=false;
  assert.throws(()=>validateRemoteCatalog(compact),/outputSchema/);
});
