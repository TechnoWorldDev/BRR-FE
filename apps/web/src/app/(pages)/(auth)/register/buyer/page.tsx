import Link from "next/link";
import AuthAwareLink from "@/components/common/AuthAwareLink";
import { ArrowLeft } from "lucide-react";
import RegisterBuyerForm from "@/components/web/Auth/Forms/RegisterBuyer";
import { generatePageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
    type: 'page',
    data: {
        title: 'Buyer Registration | Join Best Branded Residences ',
        description: 'Register as a buyer to access exclusive features and elevate your property experience.',
        slug: 'register/buyer',
        keywords: ['register', 'buyer', 'property', 'experience']
    }
})

const RegisterBuyer = () => {
    return (
        <div className="flex items-center justify-center w-full custom-form">
            <div className="w-full py-6 lg:p-8">
                <div className="flex flex-col gap-3 mb-1">
                    <div className="flex w-full flex-row items-center justify-between">
                        <AuthAwareLink href="/register" className="text-balance cursor-pointer text-md font-medium text-primary-foreground flex items-center gap-1 hover:text-primary transition-all mb-3"> 
                        <ArrowLeft size={20} />
                        Return back
                        </AuthAwareLink>
                        <span className="text-muted-foreground text-md font-medium">Buyer account</span>
                    </div>
                    <h1 className="text-4xl font-bold text-left lg:text-left">Just a few clicks from creating your BBR account</h1>
                    <p className="mb-6 text-muted-foreground text-md">
                        It takes less then 2 minutes to join our community to access exclusive features and elevate your property experience. 
                    </p>
                </div>
                <h2 className="text-sans text-xl lg:text-2xl">Create BBR account as a buyer</h2>
                <RegisterBuyerForm />
            </div>
        </div>
    )
}

export default RegisterBuyer;