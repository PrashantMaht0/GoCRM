import React, { useState } from 'react';

export default function Chat() {
  const [activeChat, setActiveChat] = useState(1);

  return (
    <div className="flex h-full w-full bg-white">
      {/* 1. Contacts List (Left Pane) */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-crm-darkest">Inbox</h2>
          <button className="text-gray-400 hover:text-crm-darkest"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg></button>
        </div>
        <div className="flex p-2 space-x-1 border-b border-gray-100 bg-gray-50">
          <button className="flex-1 py-1.5 bg-white shadow-sm rounded-md text-sm font-medium text-crm-darkest">All</button>
          <button className="flex-1 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-crm-darkest">Closed</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Active Contact */}
          <div className="p-4 bg-crm-light/30 border-l-4 border-crm-accent cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-semibold text-crm-darkest">Kathryn Murphy</h3>
              <span className="text-xs text-green-600 font-medium">3 min</span>
            </div>
            <p className="text-xs text-gray-500 truncate">Sure sir, I will discuss...</p>
          </div>
          {/* Inactive Contact */}
          <div className="p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-medium text-crm-darkest">Cameron Williamson</h3>
              <span className="text-xs text-gray-400">16 hour ago</span>
            </div>
            <p className="text-xs text-gray-500 truncate">Received</p>
          </div>
        </div>
      </div>

      {/* 2. Active Chat (Middle Pane) */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {/* Chat Header */}
        <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-lg font-semibold text-crm-darkest">Kathryn Murphy</h2>
          <div className="flex space-x-3">
            <button className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium flex items-center"><svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>Call</button>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-center"><span className="text-xs text-gray-400">Jun 5</span></div>
          
          {/* Incoming Message */}
          <div className="flex items-start max-w-lg">
             <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                <p className="text-sm text-gray-700">I want to purchase your subscription for my enterprise but I need some customisation as per my demand</p>
             </div>
          </div>

          {/* Outgoing Message */}
          <div className="flex items-start justify-end">
             <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl rounded-tr-none shadow-sm max-w-lg">
                <p className="text-sm text-indigo-900 mb-2">Hello sir, Thank you so much for reaching out. Definitely we can customize our site for your enterprise.</p>
                <p className="text-xs text-indigo-700/80 mt-2">Janna - Customer Success Manager</p>
             </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
            <input type="text" placeholder="Type your message" className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700" />
            <button className="p-2 text-gray-400 hover:text-indigo-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg></button>
            <button className="p-2 ml-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><svg className="w-4 h-4 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg></button>
          </div>
        </div>
      </div>

      {/* 3. Details (Right Pane) */}
      <div className="w-80 border-l border-gray-100 bg-white overflow-y-auto hidden xl:block">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-crm-darkest mb-6">Details</h3>
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">KM</div>
            <div>
              <h4 className="text-sm font-semibold text-crm-darkest">Kathryn Murphy</h4>
              <p className="text-xs text-gray-500">Founder & CEO at Armani</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Company</span><span className="font-medium text-crm-darkest">Armani</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Location</span><span className="font-medium text-crm-darkest">San Jose, CA</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Value</span><span className="font-medium text-crm-darkest">$1.5 B</span></div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h4 className="text-sm font-semibold text-crm-darkest mb-4">Status</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Status</span><span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200">Active</span></div>
              <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Stage</span><span className="text-indigo-600 font-medium">Needs Analysis</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}