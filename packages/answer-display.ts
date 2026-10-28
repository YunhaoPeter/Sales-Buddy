/** Historical fixture records stay intact in storage, but do not expose a user-selectable demo mode. */
export function answerDisplayText(message:{mode?:string;content?:string;text?:string}){const text=message.content||message.text||'';return message.mode==='replay'?text.replace(/^>\s*演示模式[^\r\n]*(?:\r?\n){1,2}/,''):text;}
