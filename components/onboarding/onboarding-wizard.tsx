'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Settings, 
  DollarSign, 
  Camera,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Step components
import { BusinessInfoStep } from './steps/business-info-step'
import { LocationHoursStep } from './steps/location-hours-step'
import { EquipmentServicesStep } from './steps/equipment-services-step'
import { PricingCapacityStep } from './steps/pricing-capacity-step'
import { MediaSettingsStep } from './steps/media-settings-step'

interface OnboardingWizardProps {
  user: {
    id: string
    name?: string | null
    email: string
    role: string
  }
  existingProfile?: Record<string, unknown>
}

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType<{
    user: { id: string; name?: string | null; email: string }
    data?: unknown
    onComplete: (data: unknown) => void
    onNext: () => void
    isLoading?: boolean
  }>
  isRequired: boolean
  estimatedTime: string
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Business Information',
    description: 'Basic business details and contact information',
    icon: Building2,
    component: BusinessInfoStep,
    isRequired: true,
    estimatedTime: '5 min',
  },
  {
    id: 2,
    title: 'Location & Hours',
    description: 'Business address and operating hours',
    icon: MapPin,
    component: LocationHoursStep,
    isRequired: true,
    estimatedTime: '7 min',
  },
  {
    id: 3,
    title: 'Equipment & Services',
    description: 'Printing capabilities and services offered',
    icon: Settings,
    component: EquipmentServicesStep,
    isRequired: true,
    estimatedTime: '10 min',
  },
  {
    id: 4,
    title: 'Pricing & Capacity',
    description: 'Pricing structure and capacity management',
    icon: DollarSign,
    component: PricingCapacityStep,
    isRequired: true,
    estimatedTime: '8 min',
  },
  {
    id: 5,
    title: 'Media & Settings',
    description: 'Photos, samples, and customer settings',
    icon: Camera,
    component: MediaSettingsStep,
    isRequired: false,
    estimatedTime: '5 min',
  },
]

export function OnboardingWizard({ user, existingProfile }: OnboardingWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [stepData, setStepData] = useState<Record<number, unknown>>({})
  const [isLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize with existing profile data
  useEffect(() => {
    if (existingProfile) {
      // Pre-populate steps with existing data
      const initialData: Record<number, unknown> = {}
      
      if (existingProfile.businessInfo || existingProfile.contactInfo) {
        initialData[1] = {
          businessInfo: existingProfile.businessInfo,
          contactInfo: existingProfile.contactInfo,
        }
        setCompletedSteps(prev => new Set([...prev, 1]))
      }
      
      if (existingProfile.location || existingProfile.businessHours) {
        initialData[2] = {
          location: existingProfile.location,
          businessHours: existingProfile.businessHours,
        }
        setCompletedSteps(prev => new Set([...prev, 2]))
      }
      
      if (existingProfile.equipment || existingProfile.services) {
        initialData[3] = {
          equipment: existingProfile.equipment,
          services: existingProfile.services,
        }
        setCompletedSteps(prev => new Set([...prev, 3]))
      }
      
      if (existingProfile.pricing || existingProfile.capacity) {
        initialData[4] = {
          pricing: existingProfile.pricing,
          capacity: existingProfile.capacity,
        }
        setCompletedSteps(prev => new Set([...prev, 4]))
      }
      
      if (existingProfile.media || existingProfile.customerSettings || existingProfile.quality) {
        initialData[5] = {
          media: existingProfile.media,
          customerSettings: existingProfile.customerSettings,
          quality: existingProfile.quality,
        }
        setCompletedSteps(prev => new Set([...prev, 5]))
      }
      
      setStepData(initialData)
    }
  }, [existingProfile])

  const progress = (completedSteps.size / ONBOARDING_STEPS.length) * 100

  const handleStepComplete = (stepId: number, data: unknown) => {
    setStepData(prev => ({ ...prev, [stepId]: data }))
    setCompletedSteps(prev => new Set([...prev, stepId]))
    setError(null)
  }

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepId: number) => {
    // Allow navigation to completed steps or the next step
    if (completedSteps.has(stepId) || stepId === Math.min(...Array.from(completedSteps)) + 1 || stepId === 1) {
      setCurrentStep(stepId)
    }
  }

  const canProceedToNext = () => {
    const step = ONBOARDING_STEPS.find(s => s.id === currentStep)
    return !step?.isRequired || completedSteps.has(currentStep)
  }

  const handleFinish = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Combine all step data into final profile
      const profileData = {
        ...stepData[1],
        ...stepData[2],
        ...stepData[3],
        ...stepData[4],
        ...stepData[5],
        platformSettings: {
          isActive: true,
          isFeatured: false,
          allowsReviews: true,
          publicProfile: true,
          searchable: true,
          promotionalOffers: false,
        }
      }

      const response = await fetch('/api/onboarding/print-shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save profile')
      }

      // Redirect to shop dashboard or profile
      router.push('/shop/dashboard?onboarding=complete')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to complete onboarding')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentStepData = ONBOARDING_STEPS.find(step => step.id === currentStep)
  const CurrentStepComponent = currentStepData?.component

  const requiredStepsCompleted = ONBOARDING_STEPS
    .filter(step => step.isRequired)
    .every(step => completedSteps.has(step.id))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Set Up Your Print Shop
          </h1>
          <p className="text-gray-600">
            Complete your profile to start receiving orders from customers
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Setup Progress
              </span>
              <span className="text-sm text-gray-500">
                {completedSteps.size} of {ONBOARDING_STEPS.length} steps completed
              </span>
            </div>
            <Progress value={progress} className="mb-4" />
            
            {/* Step indicators */}
            <div className="flex items-center justify-between">
              {ONBOARDING_STEPS.map((step) => {
                const isCompleted = completedSteps.has(step.id)
                const isCurrent = currentStep === step.id
                const isClickable = isCompleted || step.id === Math.min(...Array.from(completedSteps)) + 1 || step.id === 1
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <button
                      onClick={() => handleStepClick(step.id)}
                      disabled={!isClickable}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                        isCompleted && "bg-green-500 border-green-500 text-white",
                        isCurrent && !isCompleted && "border-blue-500 text-blue-500",
                        !isCurrent && !isCompleted && "border-gray-300 text-gray-400",
                        isClickable && "hover:border-blue-400 cursor-pointer",
                        !isClickable && "cursor-not-allowed"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </button>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium text-gray-700">{step.title}</p>
                      <p className="text-xs text-gray-500">{step.estimatedTime}</p>
                      {step.isRequired && (
                        <Badge variant="secondary" className="text-xs mt-1">Required</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Current Step */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              {currentStepData && (
                <currentStepData.icon className="h-6 w-6 text-blue-500" />
              )}
              <div>
                <CardTitle>{currentStepData?.title}</CardTitle>
                <CardDescription>{currentStepData?.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {CurrentStepComponent && (
              <CurrentStepComponent
                user={user}
                data={stepData[currentStep]}
                onComplete={(data: unknown) => handleStepComplete(currentStep, data)}
                onNext={handleNext}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            {currentStep < ONBOARDING_STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!requiredStepsCompleted || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </div>

        {/* Help text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@printmarket.com" className="text-blue-500 hover:underline">
              support@printmarket.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}