'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Shield, Eye, Download, Trash2, Settings, Clock, Database, Users, Activity } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import type { ConsentPreferences, DataUsageConsent } from '@/lib/validations/profile'

interface DataUsage {
  type: string
  description: string
  lastAccessed: string
  size: string
  retention: string
  icon: React.ComponentType<{ className?: string }>
}

interface PrivacyDashboardProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
    lastLogin?: string
  }
  consent?: ConsentPreferences
  dataUsage?: DataUsageConsent
  onConsentUpdate: (consent: ConsentPreferences) => Promise<void>
  onDataUsageUpdate: (dataUsage: DataUsageConsent) => Promise<void>
  onDataExport: () => Promise<void>
  onAccountDeletion: () => Promise<void>
  isLoading?: boolean
}

export function PrivacyDashboard({
  user,
  consent = {
    essential: true,
    analytics: false,
    marketing: false,
    thirdParty: false,
    communications: false
  },
  dataUsage = {
    profileData: true,
    activityTracking: false,
    communicationHistory: true,
    fileUploads: true,
    behavioralAnalytics: false,
    thirdPartySharing: false,
    marketingAnalytics: false
  },
  onConsentUpdate,
  onDataUsageUpdate,
  onDataExport,
  onAccountDeletion,
  isLoading = false
}: PrivacyDashboardProps) {
  const [localConsent, setLocalConsent] = useState<ConsentPreferences>(consent)
  const [localDataUsage, setLocalDataUsage] = useState<DataUsageConsent>(dataUsage)
  const { toast } = useToast()

  const dataUsageItems: DataUsage[] = [
    {
      type: 'Profile Information',
      description: 'Your personal details, contact information, and preferences',
      lastAccessed: new Date().toLocaleDateString(),
      size: '2.5 KB',
      retention: 'Until account deletion',
      icon: Users
    },
    {
      type: 'Activity Data',
      description: 'Login history, page visits, and feature usage',
      lastAccessed: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
      size: '15.2 KB',
      retention: '90 days',
      icon: Activity
    },
    {
      type: 'Communication History',
      description: 'Email notifications, messages, and support interactions',
      lastAccessed: new Date().toLocaleDateString(),
      size: '8.7 KB',
      retention: '2 years',
      icon: Database
    },
    {
      type: 'File Uploads',
      description: 'Profile images, documents, and other uploaded content',
      lastAccessed: new Date().toLocaleDateString(),
      size: '1.2 MB',
      retention: 'Until manually deleted',
      icon: Download
    }
  ]

  const handleConsentChange = async (key: keyof ConsentPreferences, value: boolean) => {
    const updatedConsent = { ...localConsent, [key]: value, updatedAt: new Date() }
    setLocalConsent(updatedConsent)
    
    try {
      await onConsentUpdate(updatedConsent)
      toast({
        title: 'Consent Updated',
        description: 'Your consent preferences have been saved.',
      })
    } catch (error) {
      // Revert on error
      setLocalConsent(localConsent)
      toast({
        title: 'Error',
        description: 'Failed to update consent preferences. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleDataUsageChange = async (key: keyof DataUsageConsent, value: boolean) => {
    const updatedDataUsage = { ...localDataUsage, [key]: value }
    setLocalDataUsage(updatedDataUsage)
    
    try {
      await onDataUsageUpdate(updatedDataUsage)
      toast({
        title: 'Data Usage Updated',
        description: 'Your data usage preferences have been saved.',
      })
    } catch (error) {
      // Revert on error
      setLocalDataUsage(localDataUsage)
      toast({
        title: 'Error',
        description: 'Failed to update data usage preferences. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleExportData = async () => {
    try {
      await onDataExport()
      toast({
        title: 'Data Export Started',
        description: 'Your data export will be downloaded shortly.',
      })
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export your data. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await onAccountDeletion()
      } catch (error) {
        toast({
          title: 'Deletion Failed',
          description: 'Failed to delete your account. Please contact support.',
          variant: 'destructive'
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your privacy settings and data usage preferences
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          GDPR Compliant
        </Badge>
      </div>

      {/* Privacy Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy Overview
          </CardTitle>
          <CardDescription>
            Current status of your privacy settings and data protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">Protected</div>
              <div className="text-sm text-muted-foreground">Profile Visibility</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Object.values(localConsent).filter(Boolean).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Consents</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">{dataUsageItems.length}</div>
              <div className="text-sm text-muted-foreground">Data Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Usage Overview
          </CardTitle>
          <CardDescription>
            What data we collect and how it's used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataUsageItems.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                <item.icon className="h-5 w-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{item.type}</h4>
                    <Badge variant="outline">{item.size}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last accessed: {item.lastAccessed}
                    </span>
                    <span>Retention: {item.retention}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consent Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Consent Management
          </CardTitle>
          <CardDescription>
            Control what data we can collect and how we use it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Essential Cookies</AlertTitle>
              <AlertDescription>
                These are required for basic functionality and cannot be disabled.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Analytics & Performance</Label>
                  <p className="text-sm text-muted-foreground">
                    Help us improve our services by collecting usage statistics
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={localConsent.analytics}
                  onCheckedChange={(checked) => handleConsentChange('analytics', checked)}
                  disabled={isLoading}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing">Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional emails and personalized recommendations
                  </p>
                </div>
                <Switch
                  id="marketing"
                  checked={localConsent.marketing}
                  onCheckedChange={(checked) => handleConsentChange('marketing', checked)}
                  disabled={isLoading}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="thirdParty">Third-Party Integrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow data sharing with trusted partners for enhanced features
                  </p>
                </div>
                <Switch
                  id="thirdParty"
                  checked={localConsent.thirdParty}
                  onCheckedChange={(checked) => handleConsentChange('thirdParty', checked)}
                  disabled={isLoading}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="communications">Communication History</Label>
                  <p className="text-sm text-muted-foreground">
                    Store email and message history for customer support
                  </p>
                </div>
                <Switch
                  id="communications"
                  checked={localConsent.communications}
                  onCheckedChange={(checked) => handleConsentChange('communications', checked)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Usage Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Data Usage Controls</CardTitle>
          <CardDescription>
            Fine-tune how your data is processed and analyzed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="behavioralAnalytics">Behavioral Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Analyze usage patterns to improve user experience
                </p>
              </div>
              <Switch
                id="behavioralAnalytics"
                checked={localDataUsage.behavioralAnalytics}
                onCheckedChange={(checked) => handleDataUsageChange('behavioralAnalytics', checked)}
                disabled={isLoading}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketingAnalytics">Marketing Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Track effectiveness of marketing campaigns and content
                </p>
              </div>
              <Switch
                id="marketingAnalytics"
                checked={localDataUsage.marketingAnalytics}
                onCheckedChange={(checked) => handleDataUsageChange('marketingAnalytics', checked)}
                disabled={isLoading}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="thirdPartySharing">Third-Party Data Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Share anonymized data with research partners
                </p>
              </div>
              <Switch
                id="thirdPartySharing"
                checked={localDataUsage.thirdPartySharing}
                onCheckedChange={(checked) => handleDataUsageChange('thirdPartySharing', checked)}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Rights (GDPR) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Rights
          </CardTitle>
          <CardDescription>
            Under GDPR, you have the following rights regarding your personal data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={isLoading}
              className="flex items-center gap-2 h-auto p-4"
            >
              <Download className="h-4 w-4" />
              <div className="text-left">
                <div className="font-semibold">Export Your Data</div>
                <div className="text-sm text-muted-foreground">
                  Download all your personal data
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.href = '/profile/edit'}
              className="flex items-center gap-2 h-auto p-4"
            >
              <Settings className="h-4 w-4" />
              <div className="text-left">
                <div className="font-semibold">Correct Your Data</div>
                <div className="text-sm text-muted-foreground">
                  Update or correct your information
                </div>
              </div>
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="flex items-center gap-2 h-auto p-4"
            >
              <Trash2 className="h-4 w-4" />
              <div className="text-left">
                <div className="font-semibold">Delete Account</div>
                <div className="text-sm text-muted-foreground">
                  Permanently delete your account
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.href = '/contact'}
              className="flex items-center gap-2 h-auto p-4"
            >
              <AlertTriangle className="h-4 w-4" />
              <div className="text-left">
                <div className="font-semibold">Object to Processing</div>
                <div className="text-sm text-muted-foreground">
                  Contact us about data processing
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Created:</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Login:</span>
              <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Policy Version:</span>
              <span>2.1 (Updated: January 2025)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}