'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { creatorProfileSchema, type CreatorProfile } from '@/lib/validations/profile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Link as LinkIcon, 
  Plus, 
  X, 
  AlertCircle, 
  CheckCircle,
  Award,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfileImageUpload } from './profile-image-upload'

interface CreatorProfileFormProps {
  user: {
    id: string
    name?: string | null
    email: string
    image?: string | null
    profile?: any
  }
  onSave: (data: CreatorProfile) => Promise<void>
  isLoading?: boolean
}

export function CreatorProfileForm({ user, onSave, isLoading = false }: CreatorProfileFormProps) {
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(user.image || null)

  const form = useForm<CreatorProfile>({
    resolver: zodResolver(creatorProfileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email,
      profile: {
        bio: user.profile?.bio || '',
        specializations: user.profile?.specializations || [],
        portfolio: user.profile?.portfolio || [],
        education: {
          degree: user.profile?.education?.degree || '',
          institution: user.profile?.education?.institution || '',
          graduationYear: user.profile?.education?.graduationYear || undefined
        },
        experience: {
          yearsTeaching: user.profile?.experience?.yearsTeaching || undefined,
          subjects: user.profile?.experience?.subjects || [],
          certifications: user.profile?.experience?.certifications || []
        },
        socialMedia: {
          website: user.profile?.socialMedia?.website || '',
          linkedin: user.profile?.socialMedia?.linkedin || '',
          twitter: user.profile?.socialMedia?.twitter || '',
          github: user.profile?.socialMedia?.github || ''
        }
      }
    }
  })

  const { fields: specializationFields, append: appendSpecialization, remove: removeSpecialization } = useFieldArray({
    control: form.control,
    name: "profile.specializations"
  })

  const { fields: portfolioFields, append: appendPortfolio, remove: removePortfolio } = useFieldArray({
    control: form.control,
    name: "profile.portfolio"
  })

  const { fields: subjectFields, append: appendSubject, remove: removeSubject } = useFieldArray({
    control: form.control,
    name: "profile.experience.subjects"
  })

  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control: form.control,
    name: "profile.experience.certifications"
  })

  const onSubmit = async (data: CreatorProfile) => {
    try {
      setSaveError(null)
      setSaveSuccess(false)
      await onSave(data)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile')
    }
  }

  const addSpecialization = () => {
    if (specializationFields.length < 10) {
      appendSpecialization('')
    }
  }

  const addPortfolio = () => {
    if (portfolioFields.length < 5) {
      appendPortfolio('')
    }
  }

  const addSubject = () => {
    if (subjectFields.length < 20) {
      appendSubject('')
    }
  }

  const addCertification = () => {
    if (certificationFields.length < 10) {
      appendCertification('')
    }
  }

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
          <AlertDescription>Profile updated successfully!</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Your public profile information that students and print shops will see.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image Upload */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Profile Image</h3>
                <ProfileImageUpload
                  currentImageUrl={currentImageUrl}
                  onImageUpdate={setCurrentImageUrl}
                  isLoading={isLoading}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter your full name"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email"
                        disabled={true}
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profile.bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Tell students about yourself, your teaching philosophy, and what makes your content unique..."
                        className="min-h-[100px]"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      {form.watch('profile.bio')?.length || 0}/500 characters
                    </p>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Specializations
              </CardTitle>
              <CardDescription>
                Add your areas of expertise to help students find your content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {specializationFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`profile.specializations.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g., Mathematics, Science, History"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSpecialization(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {specializationFields.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSpecialization}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Specialization
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
              <CardDescription>
                Share your educational background to build credibility with students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="profile.education.degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., Master of Education, PhD in Mathematics"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profile.education.institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., Stanford University, UC Berkeley"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profile.education.graduationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graduation Year</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 10}
                        placeholder="2020"
                        disabled={isLoading}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Teaching Experience
              </CardTitle>
              <CardDescription>
                Highlight your teaching experience and qualifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="profile.experience.yearsTeaching"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Teaching Experience</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        min="0"
                        max="50"
                        placeholder="5"
                        disabled={isLoading}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="text-base font-medium">Subjects Taught</FormLabel>
                <p className="text-sm text-muted-foreground mb-3">List the subjects you have taught or create content for.</p>
                <div className="space-y-2">
                  {subjectFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`profile.experience.subjects.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g., Calculus, Biology, World History"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSubject(index)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {subjectFields.length < 20 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSubject}
                    disabled={isLoading}
                    className="w-full mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                )}
              </div>

              <div>
                <FormLabel className="text-base font-medium">Certifications</FormLabel>
                <p className="text-sm text-muted-foreground mb-3">Add any relevant teaching certifications or credentials.</p>
                <div className="space-y-2">
                  {certificationFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`profile.experience.certifications.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g., Teaching Credential, TEFL Certificate"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeCertification(index)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {certificationFields.length < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCertification}
                    disabled={isLoading}
                    className="w-full mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Portfolio Links
              </CardTitle>
              <CardDescription>
                Add links to your existing educational content, websites, or resources.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {portfolioFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`profile.portfolio.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              {...field} 
                              type="url"
                              placeholder="https://example.com/my-resources"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removePortfolio(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {portfolioFields.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPortfolio}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Portfolio Link
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Online Presence
              </CardTitle>
              <CardDescription>
                Link your professional social media profiles and website.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="profile.socialMedia.website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Website</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="url"
                        placeholder="https://yourwebsite.com"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profile.socialMedia.linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="url"
                        placeholder="https://linkedin.com/in/yourprofile"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profile.socialMedia.twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter/X Profile</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="url"
                        placeholder="https://twitter.com/yourusername"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profile.socialMedia.github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Profile</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="url"
                        placeholder="https://github.com/yourusername"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              Reset Changes
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className={cn(
                "min-w-[120px]",
                saveSuccess && "bg-green-600 hover:bg-green-700"
              )}
            >
              {isLoading ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}