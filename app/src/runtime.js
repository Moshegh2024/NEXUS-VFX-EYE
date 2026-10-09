export const STATES=['BOOT','HOME','DAY_OVERVIEW','STAGE_MINUS_1','STAGE_0_CONSENT','MISSION_INTRO','MISSION_PLAY','EXAMINER_REVIEW','RESULTS','SKILL_GRAPH','REVIEW_QUEUE','SYNC','ERROR'];
const FORBIDDEN=new Set(['WRITE_GROUND_TRUTH','WRITE_MASTERY','MUTATE_CANONICAL','MUTATE_MISSION_REFERENCE']);
const required=['observations','evidence','hypotheses','diagnosis','causal_chain','correction_order','confidence'];
export class RuntimeError extends Error {}
export class Runtime {
 constructor(snapshot=null){this.s=snapshot||{state:'BOOT',day_id:null,mission_id:null,stage0_consent:false,attempt:{},submitted:false,error:null};}
 dispatch(action,p={}) {
  if(FORBIDDEN.has(action)) throw new RuntimeError('forbidden client action: '+action);
  const s=this.s;
  if(action==='BOOT_COMPLETE') this.goto('HOME');
  else if(action==='OPEN_DAY'){if(!p.day_id||!p.mission_id)throw new RuntimeError('valid day_id and mission_id required');Object.assign(s,{day_id:p.day_id,mission_id:p.mission_id,stage0_consent:false,submitted:false,attempt:{},error:null});this.goto('DAY_OVERVIEW');}
  else if(action==='START_STAGE_MINUS_1'){this.req('DAY_OVERVIEW');this.goto('STAGE_MINUS_1');}
  else if(action==='OPEN_STAGE_0'){this.req('STAGE_MINUS_1');this.goto('STAGE_0_CONSENT');}
  else if(action==='GRANT_STAGE_0_CONSENT'){this.req('STAGE_0_CONSENT');s.stage0_consent=true;this.goto('MISSION_INTRO');}
  else if(action==='DENY_STAGE_0_CONSENT'){this.req('STAGE_0_CONSENT');s.stage0_consent=false;this.goto('DAY_OVERVIEW');}
  else if(action==='START_MISSION'){this.req('MISSION_INTRO');if(!s.stage0_consent)throw new RuntimeError('Stage 0 consent required');this.goto('MISSION_PLAY');}
  else if(action==='SET_OBSERVATION')this.field('observations',p.value||[]);
  else if(action==='ADD_EVIDENCE')this.list('evidence',p.value);
  else if(action==='ADD_HYPOTHESIS')this.list('hypotheses',p.value);
  else if(action==='SET_DIAGNOSIS')this.field('diagnosis',p.value);
  else if(action==='SET_CAUSAL_CHAIN')this.field('causal_chain',p.value);
  else if(action==='SET_CORRECTION_ORDER')this.field('correction_order',p.value);
  else if(action==='SET_CONFIDENCE')this.field('confidence',p.value);
  else if(action==='SUBMIT_ATTEMPT'){this.req('MISSION_PLAY');this.validate();s.submitted=true;this.goto('EXAMINER_REVIEW');}
  else if(action==='OPEN_RESULTS'){this.req('EXAMINER_REVIEW');this.goto('RESULTS');}
  else if(action==='OPEN_SKILL_GRAPH')this.goto('SKILL_GRAPH');
  else if(action==='OPEN_REVIEW_QUEUE')this.goto('REVIEW_QUEUE');
  else if(action==='START_SYNC')this.goto('SYNC');
  else if(action==='RECOVER'||action==='RESET_SAFE')this.s={state:'HOME',day_id:null,mission_id:null,stage0_consent:false,attempt:{},submitted:false,error:null};
  else throw new RuntimeError('unknown action: '+action);
  return structuredClone(this.s);
 }
 req(x){if(this.s.state!==x)throw new RuntimeError(`invalid transition from ${this.s.state}; expected ${x}`);}
 goto(x){this.s.state=x;}
 field(k,v){this.req('MISSION_PLAY');this.s.attempt[k]=v;}
 list(k,v){this.req('MISSION_PLAY');if(v==null)throw new RuntimeError('list item required');(this.s.attempt[k]??=[]).push(v);}
 validate(){
  const a=this.s.attempt;
  const textFields=['diagnosis','causal_chain','correction_order'];
  const missing=required.filter(k=>{
    const v=a[k];
    if(v==null) return true;
    if(typeof v==='string') return v.trim().length===0;
    if(Array.isArray(v)) return v.length===0;
    return false;
  });
  if(missing.length) throw new RuntimeError('submission incomplete: '+missing.join(','));
  if(!Array.isArray(a.observations)||!a.observations.length||!a.observations.every(v=>typeof v==='string'&&v.trim().length>0))
    throw new RuntimeError('observations must be a non-empty list of non-blank strings');
  if(!Array.isArray(a.evidence)||!a.evidence.length||!a.evidence.every(v=>typeof v==='string'&&v.trim().length>0))
    throw new RuntimeError('evidence must be a non-empty list of non-blank strings');
  if(!Array.isArray(a.hypotheses)||a.hypotheses.length<2||!a.hypotheses.every(v=>typeof v==='string'&&v.trim().length>0))
    throw new RuntimeError('at least two non-blank competing hypotheses are required');
  for(const k of textFields) if(typeof a[k]!=='string'||!a[k].trim())
    throw new RuntimeError(k+' must be non-blank text');
  if(typeof a.confidence!=='number'||!Number.isFinite(a.confidence)||a.confidence<0||a.confidence>100)
    throw new RuntimeError('confidence must be a finite number from 0 to 100');
}
 snapshot(){return structuredClone(this.s);}
}