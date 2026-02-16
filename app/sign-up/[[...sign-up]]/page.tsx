import { SignUp } from '@clerk/nextjs'

export function generateStaticParams() {
  return [{ 'sign-up': [] }]
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-bg-void flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Create your <span className="text-accent">SimpleClaw</span> account
          </h1>
          <p className="text-text-secondary">
            Get your AI agent running in under a minute
          </p>
        </div>
        
        <div className="bg-surface-elevated border border-border-subtle shadow-2xl rounded-xl p-8">
          <p className="text-center text-sm text-muted mb-6">
            Continue with your Google account
          </p>
          
          <SignUp 
            appearance={{
              elements: {
                rootBox: 'mx-auto w-full',
                card: 'shadow-none p-0 bg-transparent',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                // Style the Google OAuth button
                socialButtonsBlockButton: 'w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-medium h-12 rounded-lg transition-colors',
                socialButtonsBlockButtonText: 'text-gray-900 font-medium',
                // Hide all email/password related elements
                dividerRow: 'hidden',
                formFieldRow: 'hidden',
                formButtonPrimary: 'hidden',
                formFieldInput: 'hidden',
                formFieldLabel: 'hidden',
                footer: 'hidden',
                identityPreview: 'hidden',
                identityPreviewText: 'hidden',
                alternativeMethods: 'hidden',
                signIn: 'hidden',
                captchaContainer: 'hidden',
                formFieldHintText: 'hidden',
                formFieldErrorText: 'hidden',
              }
            }}
            fallbackRedirectUrl="/"
          />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <a href="/sign-in" className="text-accent hover:underline font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
