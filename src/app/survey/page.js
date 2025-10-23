'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '../../utils/apiService';
import SimpleTextInput from '../../components/SimpleTextInput';
import SimpleButton from '../../components/SimpleButton';
import SimpleRadio from '../../components/SimpleRadio';
import Checkbox from '../../components/Checkbox';

const SURVEY_STORAGE_KEY = 'maps4fs_survey_completed';

export default function SurveyPage() {
  const router = useRouter();
  const [surveyData, setSurveyData] = useState({
    howDidYouHear: '',
    experience: '',
    favoriteFeatures: [],
    suggestions: '',
    rating: '',
    email: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSentSurvey, setHasSentSurvey] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Check if user has already sent survey
  useEffect(() => {
    const sent = localStorage.getItem(SURVEY_STORAGE_KEY);
    setHasSentSurvey(sent === 'true');
  }, []);

  const howDidYouHearOptions = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'github', label: 'GitHub' },
    { value: 'friend', label: 'Friend/Word of mouth' },
    { value: 'forums', label: 'FS Forums' },
    { value: 'reddit', label: 'Reddit' },
    { value: 'search', label: 'Search Engine' },
    { value: 'other', label: 'Other' }
  ];

  const experienceOptions = [
    { value: 'beginner', label: 'Beginner (new to map making)' },
    { value: 'intermediate', label: 'Intermediate (some experience)' },
    { value: 'advanced', label: 'Advanced (experienced map maker)' },
    { value: 'expert', label: 'Expert (professional level)' }
  ];

  const ratingOptions = [
    { value: '5', label: '5 - Excellent' },
    { value: '4', label: '4 - Good' },
    { value: '3', label: '3 - Average' },
    { value: '2', label: '2 - Poor' },
    { value: '1', label: '1 - Very Poor' }
  ];

  const featureOptions = [
    'Real terrain generation',
    'Height maps from SRTM',
    'OpenStreetMap integration',
    'Multiple map sizes',
    'Satellite imagery',
    'Road generation',
    'Water detection',
    'Field boundaries',
    'Forest areas'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        results: surveyData
      };

      await apiService.post('/users/receive_survey', payload);
      
      localStorage.setItem(SURVEY_STORAGE_KEY, 'true');
      setHasSentSurvey(true);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Survey submission error:', error);
      setSubmitError('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(SURVEY_STORAGE_KEY);
    setHasSentSurvey(false);
    setSubmitSuccess(false);
    setSurveyData({
      howDidYouHear: '',
      experience: '',
      favoriteFeatures: [],
      suggestions: '',
      rating: '',
      email: ''
    });
  };

  const handleFeatureChange = (feature, checked) => {
    setSurveyData(prev => ({
      ...prev,
      favoriteFeatures: checked 
        ? [...prev.favoriteFeatures, feature]
        : prev.favoriteFeatures.filter(f => f !== feature)
    }));
  };

  if (hasSentSurvey && submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Thank You!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Your feedback has been submitted successfully. We really appreciate your input!
              </p>
              <div className="space-y-4">
                <SimpleButton 
                  onClick={() => router.push('/')}
                  variant="primary"
                >
                  Back to Generator
                </SimpleButton>
                <SimpleButton 
                  onClick={handleReset}
                  variant="secondary"
                >
                  Submit Again
                </SimpleButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Maps4FS Survey
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Help me improve Maps4FS by sharing your feedback!
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <SimpleRadio
                name="howDidYouHear"
                label="How did you hear about Maps4FS?"
                options={howDidYouHearOptions}
                selectedValue={surveyData.howDidYouHear}
                onChange={(value) => setSurveyData(prev => ({ ...prev, howDidYouHear: value }))}
                required
              />

              <SimpleRadio
                name="experience"
                label="What's your experience level with map making?"
                options={experienceOptions}
                selectedValue={surveyData.experience}
                onChange={(value) => setSurveyData(prev => ({ ...prev, experience: value }))}
                required
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Which features do you find most useful? (select all that apply)
                </label>
                <div className="space-y-2">
                  {featureOptions.map((feature) => (
                    <Checkbox
                      key={feature}
                      label={feature}
                      checked={surveyData.favoriteFeatures.includes(feature)}
                      onChange={(checked) => handleFeatureChange(feature, checked)}
                      size="sm"
                    />
                  ))}
                </div>
              </div>

              <SimpleRadio
                name="rating"
                label="How would you rate Maps4FS overall?"
                options={ratingOptions}
                selectedValue={surveyData.rating}
                onChange={(value) => setSurveyData(prev => ({ ...prev, rating: value }))}
                required
              />

              <SimpleTextInput
                label="What improvements would you like to see?"
                value={surveyData.suggestions}
                onChange={(value) => setSurveyData(prev => ({ ...prev, suggestions: value }))}
                placeholder="Your suggestions..."
                multiline
                rows={4}
              />

              <SimpleTextInput
                label="Email (optional - for follow-up questions)"
                value={surveyData.email}
                onChange={(value) => setSurveyData(prev => ({ ...prev, email: value }))}
                placeholder="your.email@example.com"
              />

              {submitError && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {submitError}
                </div>
              )}

              <div className="flex space-x-4">
                <SimpleButton
                  type="submit"
                  disabled={isSubmitting}
                  variant="primary"
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                </SimpleButton>
                <SimpleButton
                  type="button"
                  onClick={() => router.push('/')}
                  variant="secondary"
                >
                  Cancel
                </SimpleButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}