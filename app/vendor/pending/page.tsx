export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mail, CheckCircle2 } from "lucide-react";

export default function VendorPendingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-10 h-10 text-amber-600" />
                    </div>
                    <CardTitle className="text-3xl">Application Under Review</CardTitle>
                    <CardDescription className="text-base">
                        Your vendor account is pending admin approval
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                        <h3 className="font-semibold text-amber-900 mb-3 flex items-center">
                            <Mail className="w-5 h-5 mr-2" />
                            What happens next?
                        </h3>
                        <ul className="space-y-3 text-amber-800">
                            <li className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-amber-600" />
                                <span>Our team is reviewing your business information and documents</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-amber-600" />
                                <span>You&apos;ll receive an email notification once your account is approved</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-amber-600" />
                                <span>Approval typically takes 1-2 business days</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-amber-600" />
                                <span>Once approved, you can start adding products and managing your store</span>
                            </li>
                        </ul>
                    </div>

                    <div className="border-t pt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Need Help?</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            If you have questions about your application or need to update your information, please contact our vendor support team.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm">
                            <p className="text-gray-700">
                                <strong>Email:</strong> vendor-support@glanzoo.com
                            </p>
                            <p className="text-gray-700 mt-1">
                                <strong>Hours:</strong> Monday - Friday, 9 AM - 6 PM IST
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
