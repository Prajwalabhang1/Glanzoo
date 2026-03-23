export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { inquiries } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { Mail, Clock, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function AdminInquiriesPage() {
    const inquiryList = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
                <p className="text-gray-600 mt-1">Manage customer inquiries and contact form submissions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500"><Mail className="w-6 h-6 text-white" /></div>
                        <div><p className="text-2xl font-bold text-gray-900">{inquiryList.length}</p><p className="text-sm text-gray-600">Total Inquiries</p></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500"><Clock className="w-6 h-6 text-white" /></div>
                        <div><p className="text-2xl font-bold text-gray-900">{inquiryList.filter(i => i.status === 'PENDING').length}</p><p className="text-sm text-gray-600">Pending</p></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500"><Reply className="w-6 h-6 text-white" /></div>
                        <div><p className="text-2xl font-bold text-gray-900">{inquiryList.filter(i => i.status === 'RESOLVED').length}</p><p className="text-sm text-gray-600">Resolved</p></div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                        <option>All Status</option><option>Pending</option><option>In Progress</option><option>Resolved</option>
                    </select>
                    <input type="search" placeholder="Search inquiries..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                </div>

                <div className="divide-y divide-gray-100">
                    {inquiryList.length > 0 ? inquiryList.map((inquiry) => (
                        <div key={inquiry.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-gray-900">{inquiry.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inquiry.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : inquiry.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                            {inquiry.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                        <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {inquiry.email}</span>
                                        {inquiry.phone && <span>📞 {inquiry.phone}</span>}
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{inquiry.message}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm"><Reply className="w-4 h-4 mr-1" /> Reply</Button>
                                    {inquiry.status === 'PENDING' && (
                                        <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500">Resolve</Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center text-gray-500">
                            <Mail className="w-12 h-12 mx-auto mb-2 text-gray-300" /><p>No inquiries yet</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">Showing <span className="font-semibold">{inquiryList.length}</span> inquiries</p>
                </div>
            </div>
        </div>
    );
}
