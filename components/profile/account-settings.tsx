'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { passwordChangeSchema, notificationPreferencesSchema, privacySettingsSchema } from '@/lib/validations/profile'
import type { PasswordChangeData, NotificationPreferences, PrivacySettings } from '@/lib/validations/profile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Key, 
  Bell, 
  Shield, 
  Download, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  Smartphone,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string
  role: string
  preferences?: {
    notifications?: {
      email: boolean
      orderUpdates: boolean
      marketing: boolean
      weeklyDigest?: boolean
      pushNotifications?: boolean
      smsNotifications?: boolean
    }
  }
  privacy?: {
    profileVisibility: 'public' | 'business-only' | 'private'
    showEmail: boolean
    showPhone: boolean
    allowDataSharing: boolean
    allowMarketingEmails: boolean
    allowAnalytics: boolean
  }
}

interface AccountSettingsProps {
  user: User
  onPasswordChange: (data: PasswordChangeData) => Promise<void>
  onNotificationUpdate: (data: NotificationPreferences) => Promise<void>
  onPrivacyUpdate: (data: PrivacySettings) => Promise<void>
  onDataExport: () => Promise<void>
  onAccountDeactivation: (reason: string) => Promise<void>
  isLoading?: boolean
}

export function AccountSettings({ 
  user, 
  onPasswordChange, 
  onNotificationUpdate,
  onPrivacyUpdate,
  onDataExport,
  onAccountDeactivation,
  isLoading = false 
}: AccountSettingsProps) {
  const [activeSection, setActiveSection] = useState<string>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showDeactivationDialog, setShowDeactivationDialog] = useState(false)
  const [deactivationReason, setDeactivationReason] = useState('')

  // Password change form
  const passwordForm = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  // Notification preferences form
  const notificationForm = useForm<NotificationPreferences>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      email: user.preferences?.notifications?.email ?? true,
      orderUpdates: user.preferences?.notifications?.orderUpdates ?? true,
      marketing: user.preferences?.notifications?.marketing ?? false,
      weeklyDigest: user.preferences?.notifications?.weeklyDigest ?? false,
      pushNotifications: user.preferences?.notifications?.pushNotifications ?? false,
      smsNotifications: user.preferences?.notifications?.smsNotifications ?? false
    }
  })

  // Privacy settings form
  const privacyForm = useForm<PrivacySettings>({
    resolver: zodResolver(privacySettingsSchema),
    defaultValues: {
      profileVisibility: user.privacy?.profileVisibility ?? 'public',
      showEmail: user.privacy?.showEmail ?? false,
      showPhone: user.privacy?.showPhone ?? false,
      allowDataSharing: user.privacy?.allowDataSharing ?? true,
      allowMarketingEmails: user.privacy?.allowMarketingEmails ?? false,
      allowAnalytics: user.privacy?.allowAnalytics ?? true
    }
  })

  const handlePasswordSubmit = async (data: PasswordChangeData) => {
    try {
      setSaveError(null)
      setSaveSuccess(null)
      await onPasswordChange(data)
      setSaveSuccess('Password updated successfully!')
      passwordForm.reset()
      setTimeout(() => setSaveSuccess(null), 3000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to update password')
    }
  }

  const handleNotificationSubmit = async (data: NotificationPreferences) => {
    try {
      setSaveError(null)
      setSaveSuccess(null)
      await onNotificationUpdate(data)
      setSaveSuccess('Notification preferences updated!')
      setTimeout(() => setSaveSuccess(null), 3000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to update preferences')
    }
  }

  const handlePrivacySubmit = async (data: PrivacySettings) => {
    try {
      setSaveError(null)
      setSaveSuccess(null)
      await onPrivacyUpdate(data)
      setSaveSuccess('Privacy settings updated!')
      setTimeout(() => setSaveSuccess(null), 3000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to update privacy settings')
    }
  }

  const handleDeactivation = async () => {
    if (!deactivationReason.trim()) {
      setSaveError('Please provide a reason for deactivation')
      return
    }

    try {
      setSaveError(null)
      await onAccountDeactivation(deactivationReason)
      setShowDeactivationDialog(false)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to deactivate account')
    }
  }

  const sections = [
    { id: 'password', label: 'Password', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'data', label: 'Data & Account', icon: Download }
  ]

  return (
    <div className="space-y-6">
      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{saveSuccess}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Account Settings</h2>
          <p className="text-muted-foreground">
            Manage your account security, preferences, and privacy settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Password Section */}
          {activeSection === 'password' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field} 
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Enter your current password"
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                              >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field} 
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your new password"
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">
                            Password must contain at least 8 characters with uppercase, lowercase, number, and special character.
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field} 
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your new password"
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about updates and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(handleNotificationSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Notifications
                      </h4>
                      
                      <FormField
                        control={notificationForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel>Email notifications</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Receive notifications via email
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="orderUpdates"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel>Order updates</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Get notified about order status changes
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="marketing"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel>Marketing emails</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Receive promotional emails and newsletters
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="weeklyDigest"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel>Weekly digest</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Summary of your weekly activity
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Push & SMS Notifications
                      </h4>

                      <FormField
                        control={notificationForm.control}
                        name="pushNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel>Push notifications</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Receive push notifications on your devices
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="smsNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel>SMS notifications</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Receive important updates via SMS
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Privacy Section */}
          {activeSection === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...privacyForm}>
                  <form onSubmit={privacyForm.handleSubmit(handlePrivacySubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Profile Visibility
                      </h4>

                      <FormField
                        control={privacyForm.control}
                        name="profileVisibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Who can see your profile</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="public">Everyone (Public)</SelectItem>
                                <SelectItem value="business-only">Business users only</SelectItem>
                                <SelectItem value="private">Private (Only you)</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                              This controls who can find and view your profile information
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={privacyForm.control}
                        name="showEmail"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel>Show email address</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Display your email on your public profile
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={privacyForm.control}
                        name="showPhone"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel>Show phone number</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Display your phone number on your public profile
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Data & Analytics</h4>

                      <FormField
                        control={privacyForm.control}
                        name="allowDataSharing"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel>Allow data sharing</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Share anonymized data to improve platform services
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={privacyForm.control}
                        name="allowMarketingEmails"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel>Allow marketing communications</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Receive personalized offers and recommendations
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={privacyForm.control}
                        name="allowAnalytics"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel>Allow usage analytics</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Help us improve the platform with usage data
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Privacy Settings'}
                    </Button>
                  </form>
                </Form>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Advanced Privacy Controls</h4>
                  <p className="text-sm text-muted-foreground">
                    For comprehensive privacy management, data usage overview, and GDPR compliance features.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/privacy/dashboard'}
                    className="flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Open Privacy Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data & Account Section */}
          {activeSection === 'data' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Data Export
                  </CardTitle>
                  <CardDescription>
                    Download a copy of your data for your records
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You can request a download of your account data including profile information,
                    order history, and content uploads.
                  </p>
                  <Button onClick={onDataExport} disabled={isLoading} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="w-5 h-5" />
                    Account Deactivation
                  </CardTitle>
                  <CardDescription>
                    Permanently deactivate your account and delete your data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-destructive/10 p-4 rounded-lg">
                    <p className="text-sm text-destructive">
                      <strong>Warning:</strong> This action cannot be undone. All your data, 
                      including profile information, orders, and content will be permanently deleted.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowDeactivationDialog(true)} 
                    disabled={isLoading} 
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deactivate Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Deactivation Dialog */}
      {showDeactivationDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">Confirm Account Deactivation</CardTitle>
              <CardDescription>
                Please tell us why you're leaving so we can improve our service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Reason for deactivation</label>
                <textarea
                  value={deactivationReason}
                  onChange={(e) => setDeactivationReason(e.target.value)}
                  placeholder="Tell us why you're deactivating your account..."
                  className="w-full mt-1 p-2 border rounded-md resize-none h-20"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeactivationDialog(false)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeactivation}
                  disabled={isLoading || !deactivationReason.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  {isLoading ? 'Processing...' : 'Deactivate Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}