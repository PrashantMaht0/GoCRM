import React from 'react';

const deals = [
  { id: 1, company: 'Intercom', title: 'Customer success platform integration', priority: 'High', date: '18 Jan', value: '$78,000', stage: 'Discovery' },
  { id: 2, company: 'Datadog', title: 'Infrastructure monitoring setup', priority: 'Medium', date: '19 Jan', value: '$230,000', stage: 'Discovery' },
  { id: 3, company: 'Vercel', title: 'Next-gen frontend deployment', priority: 'High', date: '15 Jan', value: '$82,500', stage: 'Proposal Sent' },
];

export default function Deals() {
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-crm-darkest">Deals</h1>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Sort</button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Filter</button>
        </div>
      </div>

      <div className="flex-1 flex space-x-6 overflow-x-auto pb-4">
        {/* Column 1 */}
        <div className="w-max flex-shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-crm-darkest">Discovery</h3>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">6</span>
            </div>
            <button className="text-gray-400 hover:text-crm-darkest">+</button>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1">
            {deals.filter(d => d.stage === 'Discovery').map(deal => (
              <div key={deal.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center text-[10px] font-bold text-blue-600">{deal.company.charAt(0)}</div>
                  <span className="text-xs font-semibold text-gray-600">{deal.company}</span>
                </div>
                <h4 className="text-sm font-medium text-crm-darkest mb-4">{deal.title}</h4>
                <div className="flex items-center space-x-3 text-xs">
                  <span className={`px-2 py-1 rounded-md font-medium ${deal.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>{deal.priority}</span>
                  <span className="text-gray-500 flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>{deal.date}</span>
                  <span className="font-semibold text-gray-700 ml-auto">{deal.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2 */}
        <div className="w-max flex-shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-crm-darkest">Proposal Sent</h3>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">5</span>
            </div>
            <button className="text-gray-400 hover:text-crm-darkest">+</button>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1">
             {deals.filter(d => d.stage === 'Proposal Sent').map(deal => (
              <div key={deal.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                {/* Same card structure as above */}
                 <div className="flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-[10px] font-bold text-white">{deal.company.charAt(0)}</div>
                  <span className="text-xs font-semibold text-gray-600">{deal.company}</span>
                </div>
                <h4 className="text-sm font-medium text-crm-darkest mb-4">{deal.title}</h4>
                <div className="flex items-center space-x-3 text-xs">
                  <span className={`px-2 py-1 rounded-md font-medium bg-red-50 text-red-600`}>{deal.priority}</span>
                  <span className="text-gray-500">{deal.date}</span>
                  <span className="font-semibold text-gray-700 ml-auto">{deal.value}</span>
                </div>
              </div>
            ))}
          </div>  
        </div>
        {/* Column 2 */}
        <div className="w-max flex-shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-crm-darkest">Negotiation</h3>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">5</span>
            </div>
            <button className="text-gray-400 hover:text-crm-darkest">+</button>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1">
             {deals.filter(d => d.stage === 'Proposal Sent').map(deal => (
              <div key={deal.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                {/* Same card structure as above */}
                 <div className="flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-[10px] font-bold text-white">{deal.company.charAt(0)}</div>
                  <span className="text-xs font-semibold text-gray-600">{deal.company}</span>
                </div>
                <h4 className="text-sm font-medium text-crm-darkest mb-4">{deal.title}</h4>
                <div className="flex items-center space-x-3 text-xs">
                  <span className={`px-2 py-1 rounded-md font-medium bg-red-50 text-red-600`}>{deal.priority}</span>
                  <span className="text-gray-500">{deal.date}</span>
                  <span className="font-semibold text-gray-700 ml-auto">{deal.value}</span>
                </div>
              </div>
            ))}
          </div>  
        </div>
        {/* Column 2 */}
        <div className="w-max flex-shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-crm-darkest">Won</h3>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">5</span>
            </div>
            <button className="text-gray-400 hover:text-crm-darkest">+</button>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1">
             {deals.filter(d => d.stage === 'Proposal Sent').map(deal => (
              <div key={deal.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                {/* Same card structure as above */}
                 <div className="flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-[10px] font-bold text-white">{deal.company.charAt(0)}</div>
                  <span className="text-xs font-semibold text-gray-600">{deal.company}</span>
                </div>
                <h4 className="text-sm font-medium text-crm-darkest mb-4">{deal.title}</h4>
                <div className="flex items-center space-x-3 text-xs">
                  <span className={`px-2 py-1 rounded-md font-medium bg-red-50 text-red-600`}>{deal.priority}</span>
                  <span className="text-gray-500">{deal.date}</span>
                  <span className="font-semibold text-gray-700 ml-auto">{deal.value}</span>
                </div>
              </div>
            ))}
          </div>  
        </div>
        {/* Column 2 */}
        <div className="w-max flex-shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-crm-darkest">Lost</h3>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">5</span>
            </div>
            <button className="text-gray-400 hover:text-crm-darkest">+</button>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1">
             {deals.filter(d => d.stage === 'Proposal Sent').map(deal => (
              <div key={deal.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                {/* Same card structure as above */}
                 <div className="flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-[10px] font-bold text-white">{deal.company.charAt(0)}</div>
                  <span className="text-xs font-semibold text-gray-600">{deal.company}</span>
                </div>
                <h4 className="text-sm font-medium text-crm-darkest mb-4">{deal.title}</h4>
                <div className="flex items-center space-x-3 text-xs">
                  <span className={`px-2 py-1 rounded-md font-medium bg-red-50 text-red-600`}>{deal.priority}</span>
                  <span className="text-gray-500">{deal.date}</span>
                  <span className="font-semibold text-gray-700 ml-auto">{deal.value}</span>
                </div>
              </div>
            ))}
          </div>  
        </div>
      </div>
    </div>
  );
}