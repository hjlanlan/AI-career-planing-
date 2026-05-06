/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Send, User, Bot, CheckCircle2, XCircle, Share, Download } from "lucide-react";
import { processTurn, generateFinalCard, Slots, ChatMessage } from "./services/aiService";
import { getRecommendedRoles } from "./services/ruleEngine";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [slots, setSlots] = useState<Slots>({ major: null, codeLevel: null, commLevel: null });
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial Greeting
    const initId = Date.now().toString();
    setMessages([
      {
        id: initId,
        role: "ai",
        text: "你好！我是你的AI职业规划师。为了帮你找到最适合的IT岗位，我需要了解几个信息。首先，请问你的大学专业是什么？",
      },
    ]);
    setQuickReplies(["计算机科学", "软件工程", "非计科的理工类", "文科专业"]);
  }, []);

  useEffect(() => {
    // Auto scroll
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping || isAnalyzing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
    };
    
    const newChatHistory = [...messages, userMessage];
    setMessages(newChatHistory);
    setInputText("");
    setQuickReplies([]);
    setIsTyping(true);

    try {
      const result = await processTurn(newChatHistory, slots);
      
      const newAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: result.replyText,
      };

      setMessages((prev) => [...prev, newAiMessage]);
      setSlots(result.newSlots);
      
      const isComplete =
        result.newSlots.major !== null &&
        result.newSlots.codeLevel !== null &&
        result.newSlots.commLevel !== null;

      if (isComplete) {
        setIsAnalyzing(true);
        const selectedRoles = getRecommendedRoles(result.newSlots);
        const cards = await generateFinalCard(result.newSlots, selectedRoles);
        setRecommendations(cards);
        setIsAnalyzing(false);
      } else {
        setQuickReplies(result.quickReplies);
      }
      
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "ai",
          text: "大脑卡壳了，请尝试重新发送。",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setMessages([{ id: Date.now().toString(), role: "ai", text: "重新开始咯！那么，你的大学专业是什么？" }]);
    setSlots({ major: null, codeLevel: null, commLevel: null });
    setQuickReplies(["计算机科学", "软件工程", "非计科的理工类", "文科专业"]);
    setRecommendations([]);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex justify-center w-full min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="w-full max-w-md h-screen max-h-screen flex flex-col bg-white shadow-xl overflow-hidden relative">
        
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white shadow-sm z-10">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            <h1 className="font-semibold text-lg">AI职业规划</h1>
          </div>
          <button onClick={handleReset} className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded-full transition-colors">
            重置
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
              {msg.role === "ai" && <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0"><Bot className="w-5 h-5 text-blue-600" /></div>}
              <div className={msg.role === "user" ? "max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed bg-blue-600 text-white rounded-br-none" : "max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed bg-gray-100 text-gray-800 rounded-tl-none"}>
                {msg.text}
              </div>
              {msg.role === "user" && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 flex-shrink-0"><User className="w-5 h-5 text-gray-500" /></div>}
            </div>
          ))}

          {isTyping && !isAnalyzing && (
            <div className="flex justify-start">
               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0"><Bot className="w-5 h-5 text-blue-600" /></div>
               <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex justify-start">
               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0"><Bot className="w-5 h-5 text-blue-600" /></div>
               <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 text-[15px] flex items-center gap-2">
                 <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                 正在为你生成专属职业规划卡片...
               </div>
            </div>
          )}

          {recommendations.length > 0 && recommendations.map((rec, i) => (
             <div key={i} className="bg-white border-2 border-blue-100 rounded-2xl shadow-sm overflow-hidden mb-4 mt-2 max-w-sm w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">推荐 {i+1}</span>
                    <h3 className="font-bold text-gray-800">{rec.role}</h3>
                  </div>
               </div>
               <div className="p-4 space-y-4">
                  <p className="text-sm text-gray-600 font-medium">{rec.definition}</p>
                  
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100">
                     <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{slots.major}</span>
                     <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{slots.codeLevel === 'High' ? '热爱代码' : slots.codeLevel === 'Medium' ? '接受代码' : '无代码'}</span>
                     <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{slots.commLevel === 'High' ? '社交牛人' : slots.commLevel === 'Medium' ? '常规沟通' : '社交恐惧'}</span>
                  </div>

                  <div className="bg-green-50 rounded-xl p-3">
                     <div className="flex items-center gap-1.5 mb-1 text-green-700 font-medium text-sm">
                       <CheckCircle2 className="w-4 h-4" />
                       你的优势
                     </div>
                     <p className="text-sm text-green-800 leading-relaxed">{rec.pros}</p>
                  </div>

                  <div className="bg-red-50 rounded-xl p-3">
                     <div className="flex items-center gap-1.5 mb-1 text-red-700 font-medium text-sm">
                       <XCircle className="w-4 h-4" />
                       潜在挑战
                     </div>
                     <p className="text-sm text-red-800 leading-relaxed">{rec.cons}</p>
                  </div>
               </div>
               
             </div>
          ))}

          {/* Action buttons at bottom if done */}
          {recommendations.length > 0 && (
             <div className="flex justify-center gap-4 py-2 mt-4 fade-in">
               <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                  <Download className="w-4 h-4" /> 保存卡片
               </button>
               <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors">
                  <Share className="w-4 h-4" /> 分享朋友
               </button>
             </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-white px-4 py-3">
           {!recommendations.length && quickReplies.length > 0 && (
             <div className="flex overflow-x-auto gap-2 pb-3 no-scrollbar">
               {quickReplies.map((reply, i) => (
                 <button 
                   key={i} 
                   onClick={() => handleSend(reply)}
                   className="whitespace-nowrap px-4 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
                 >
                   {reply}
                 </button>
               ))}
             </div>
           )}

           <div className="relative flex items-center">
             <input
               type="text"
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === "Enter") handleSend(inputText);
               }}
               placeholder={recommendations.length ? "已完成匹配，点击右上角重置" : "输入你的回答..."}
               disabled={isTyping || isAnalyzing || recommendations.length > 0}
               className="w-full bg-gray-100 text-gray-800 rounded-full py-2.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
             />
             <button
               onClick={() => handleSend(inputText)}
               disabled={!inputText.trim() || isTyping || isAnalyzing || recommendations.length > 0}
               className="absolute right-1 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:bg-gray-400"
             >
               <Send className="w-4 h-4 -ml-0.5" />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

