import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
              <p className="text-lg text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Acceptance of Terms</h2>
                <p>
                  By accessing and using PrintMarket (&quot;Platform&quot;, &quot;Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and PrintMarket.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Platform Description</h2>
                <p>
                  PrintMarket is an educational content printing marketplace that connects:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Students seeking to print educational materials locally</li>
                  <li>Content creators who upload educational materials for printing</li>
                  <li>Print shops that provide printing services</li>
                </ul>
                <p>
                  We facilitate transactions but are not a party to the actual printing services or content licensing agreements.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">User Accounts and Responsibilities</h2>
                
                <h3 className="text-xl font-medium">Account Creation</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must be at least 13 years old to use our service</li>
                  <li>One person may not maintain multiple accounts</li>
                </ul>

                <h3 className="text-xl font-medium">User Conduct</h3>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Upload copyrighted content without proper authorization</li>
                  <li>Use the platform for illegal or unauthorized purposes</li>
                  <li>Interfere with or disrupt platform operations</li>
                  <li>Attempt to gain unauthorized access to other accounts</li>
                  <li>Post harmful, offensive, or inappropriate content</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Content and Intellectual Property</h2>
                
                <h3 className="text-xl font-medium">User Content</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You retain ownership of content you upload</li>
                  <li>You grant us a license to display and distribute your content through our platform</li>
                  <li>You warrant that you have the right to upload and distribute your content</li>
                  <li>You are responsible for ensuring your content doesn&apos;t infringe on others&apos; rights</li>
                </ul>

                <h3 className="text-xl font-medium">Platform Content</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Our platform interface and features are protected by intellectual property laws</li>
                  <li>You may not copy, modify, or reverse engineer our platform</li>
                  <li>All trademarks and service marks are the property of their respective owners</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Payments and Refunds</h2>
                
                <h3 className="text-xl font-medium">Payment Processing</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All payments are processed through secure third-party providers</li>
                  <li>Prices are displayed in USD and may be subject to applicable taxes</li>
                  <li>Payment is due at the time of order placement</li>
                </ul>

                <h3 className="text-xl font-medium">Refund Policy</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Refunds for print orders are subject to print shop policies</li>
                  <li>Digital content sales are generally non-refundable</li>
                  <li>We may issue refunds at our discretion for platform errors</li>
                  <li>Disputed transactions will be handled case-by-case</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Print Shop Partnership</h2>
                <p>Print shops using our platform agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintain quality standards for all print jobs</li>
                  <li>Process orders in a timely manner</li>
                  <li>Handle customer service for their print orders</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Pay platform fees as specified in partnership agreements</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Creator Responsibilities</h2>
                <p>Content creators using our platform agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Only upload original content or content they have rights to distribute</li>
                  <li>Ensure content is suitable for educational purposes</li>
                  <li>Maintain appropriate content quality standards</li>
                  <li>Respond to content-related inquiries in a timely manner</li>
                  <li>Comply with our content guidelines and policies</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Platform Availability and Modifications</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We strive to maintain platform availability but cannot guarantee 100% uptime</li>
                  <li>We may modify or discontinue features with reasonable notice</li>
                  <li>Scheduled maintenance may temporarily affect service availability</li>
                  <li>We reserve the right to suspend accounts that violate these terms</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, PrintMarket shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or related to your use of the platform.
                </p>
                <p>
                  Our total liability for any claims related to the platform shall not exceed the amount you paid to us in the twelve months preceding the claim.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Indemnification</h2>
                <p>
                  You agree to indemnify and hold harmless PrintMarket from any claims, damages, losses, and expenses arising from your use of the platform, your content, or your violation of these terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Termination</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You may terminate your account at any time</li>
                  <li>We may suspend or terminate accounts that violate these terms</li>
                  <li>Upon termination, your right to use the platform ceases immediately</li>
                  <li>Certain provisions of these terms survive termination</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Governing Law</h2>
                <p>
                  These terms are governed by the laws of the State of California, without regard to conflict of law principles. Any disputes will be resolved in the courts of San Francisco County, California.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Changes to Terms</h2>
                <p>
                  We may update these terms from time to time. We will notify users of material changes by posting the updated terms on our platform and updating the effective date. Continued use of the platform after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Contact Information</h2>
                <p>
                  For questions about these Terms of Service, please contact us:
                </p>
                <ul className="list-none space-y-2">
                  <li>Email: legal@printmarket.com</li>
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