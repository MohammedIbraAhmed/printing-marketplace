import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
              <p className="text-lg text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Introduction</h2>
                <p>
                  PrintMarket (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you use our educational content printing marketplace platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Information We Collect</h2>
                
                <h3 className="text-xl font-medium">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Account credentials and authentication information</li>
                  <li>Profile information including role (student, creator, print shop)</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Educational institution affiliation</li>
                </ul>

                <h3 className="text-xl font-medium">Content and Usage Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Content you upload, create, or share on our platform</li>
                  <li>Print orders and transaction history</li>
                  <li>Platform usage analytics and preferences</li>
                  <li>Communication records and support interactions</li>
                </ul>

                <h3 className="text-xl font-medium">Technical Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Log files and error reports</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and maintain our marketplace platform services</li>
                  <li>Process print orders and facilitate transactions</li>
                  <li>Communicate with you about orders, updates, and support</li>
                  <li>Improve our platform and develop new features</li>
                  <li>Ensure platform security and prevent fraud</li>
                  <li>Comply with legal obligations and enforce our terms</li>
                  <li>Send marketing communications (with your consent)</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Information Sharing</h2>
                <p>We may share your information in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Print Shop Partners:</strong> Order details necessary for fulfillment</li>
                  <li><strong>Content Creators:</strong> Purchase information for royalty payments</li>
                  <li><strong>Service Providers:</strong> Third-party services that help us operate our platform</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                </ul>
                <p className="mt-4">
                  We never sell your personal information to third parties for marketing purposes.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Data Security</h2>
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and monitoring</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Secure payment processing through certified providers</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Your Rights</h2>
                <p>Depending on your location, you may have the following rights:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access to your personal information</li>
                  <li>Correction of inaccurate or incomplete information</li>
                  <li>Deletion of your personal information</li>
                  <li>Restriction of processing</li>
                  <li>Data portability</li>
                  <li>Objection to processing for marketing purposes</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us at privacy@printmarket.com.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Cookies and Tracking</h2>
                <p>
                  We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Changes to This Policy</h2>
                <p>
                  We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on our platform and updating the effective date.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Contact Us</h2>
                <p>
                  If you have any questions about this privacy policy or our data practices, please contact us:
                </p>
                <ul className="list-none space-y-2">
                  <li>Email: privacy@printmarket.com</li>
                  <li>Address: 123 Main Street, San Francisco, CA 94105</li>
                  <li>Phone: 1-800-PRINT-NOW</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}