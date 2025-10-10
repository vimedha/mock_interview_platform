/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Image from 'next/image'
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
enum CallStatus {
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
  CONNECTING = 'CONNECTING',
  FINISHED = 'FINISHED',
}
interface SavedMessage{
  role: MessageRoleEnum;
  content: string;
}

const Agent = ({ userName, userId }: AgentProps) => {
  const router=useRouter();
  const [isSpeaking,setIsSpeaking] = useState(false);
  // Add state for call status (or set it as a variable)
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages]= useState<SavedMessage[]>([]);
  const vapiRef = useRef<any>(null);

  const supportsAudio = typeof navigator !== 'undefined'
    && !!navigator.mediaDevices
    && typeof navigator.mediaDevices.getUserMedia === 'function'
    && typeof (globalThis as any).AudioContext !== 'undefined'
    && (globalThis as any).isSecureContext !== false; // true for HTTPS and localhost
useEffect(()=>{
  let mounted = true;
  (async () => {
    // Lazy-load the SDK to avoid initializing audio on unsupported pages
    const mod = await import('@/lib/vapi.sdk');
    if (!mounted) return;
    vapiRef.current = mod.vapi;

    const onCallStart=()=> setCallStatus(CallStatus.ACTIVE);
    const onCallEnd=()=> setCallStatus(CallStatus.FINISHED);
    const onMessage=(message: Message)=>{
      if(message.type=== 'transcript' && message.transcriptType==='final'){
        const newMessage = {role: message.role, content: message.transcript}
        setMessages((prev)=>[...prev,newMessage])
      }
    }
    const onSpeechStart=()=> setIsSpeaking(true);
    const onSpeechEnd=()=> setIsSpeaking(false);
    const onError=(error: Error)=> console.log('Error', error);

    const vapi = vapiRef.current;
    if (!vapi) return;
    vapi.on('call-start',onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('message', onMessage);
    // Register speech events only if audio is supported
    if (supportsAudio) {
      vapi.on('speech-start', onSpeechStart);
      vapi.on('speech-end', onSpeechEnd);
    }
    vapi.on('error', onError);

    return () => {
      const v = vapiRef.current;
      if (!v) return;
      v.off('call-start',onCallStart);
      v.off('call-end', onCallEnd);
      v.off('message', onMessage);
      if (supportsAudio) {
        v.off('speech-start', onSpeechStart);
        v.off('speech-end', onSpeechEnd);
      }
      v.off('error', onError);
    };
  })();
  return () => { mounted = false; };
},[supportsAudio])
useEffect(()=>{
  if(callStatus=== CallStatus.FINISHED) router.push('/');
},[callStatus, router]);
const handleCall=async()=>{
  setCallStatus(CallStatus.CONNECTING);
  if (!vapiRef.current) {
    const mod = await import('@/lib/vapi.sdk');
    vapiRef.current = mod.vapi;
  }
  const vapi = vapiRef.current;
  await vapi.start(
    undefined,
    undefined,
    undefined,
    process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,
    {
      variableValues: {
        username: userName,
        userid: userId,
      },
    }
  );
}
const handleDisconnect=async()=>{
  setCallStatus(CallStatus.FINISHED);
  if (vapiRef.current) vapiRef.current.stop();
}
const latestMessage=messages[messages.length-1]?.content;
const isCallInactiveOrFinished=callStatus=== CallStatus.INACTIVE||callStatus=== CallStatus.FINISHED;
  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image src="/ai-avatar.png" alt="vapi" width={65} height={54} className="object-cover" />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>
        <div className="card-border">
          <div className="card-content">
            <Image src="/user-avatar.png" alt="user avatar" width={540} height={540} className="rounded-full object-cover size-[120px]" />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>
      {messages.length>0 && (
        <div className="transcript-border">
                <div className="transcript">
                        <p key={latestMessage} className={cn('transition-opacity duration-500 opacity-0','animate-fadeIn opacity-100')}>
                                
                                {latestMessage}
                        </p>
                        </div>
        </div>
      )}


      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus !== CallStatus.CONNECTING && 'hidden')}/>
             
          <span>
                 {isCallInactiveOrFinished?'Call' : '. . .'}
          </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  )
}

export default Agent
