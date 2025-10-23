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
    rating: '',
    triedLocalDeploy: '',
    deploySuccess: '',
    deploymentChallenges: '',
    documentationClear: '',
    dtmAvailable: '',
    englishTrouble: '',
    triedCustomOsm: '',
    facedErrors: '',
    knowWhereHelp: '',
    finishedMaps: '',
    publishedMaps: '',
    joinedDiscord: '',
    followUpdates: '',
    tutorialPreference: '',
    missingFeatures: '',
    likeMost: '',
    interfaceClear: '',
    additionalFeedback: ''
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

  const yesNoOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const deploySuccessOptions = [
    { value: 'succeeded', label: 'Yes, I managed to deploy it successfully' },
    { value: 'challenges', label: 'I tried but faced challenges and dropped it' },
    { value: 'not-tried', label: 'I haven\'t tried to deploy locally yet' }
  ];

  const tutorialPreferenceOptions = [
    { value: 'text', label: 'Text documentation' },
    { value: 'youtube', label: 'YouTube videos' },
    { value: 'both', label: 'Both text and videos' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        results: {}
      };

      // Only include fields that have values
      Object.keys(surveyData).forEach(key => {
        if (surveyData[key] && surveyData[key] !== '') {
          payload.results[key] = surveyData[key];
        }
      });

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
      rating: '',
      triedLocalDeploy: '',
      deploySuccess: '',
      deploymentChallenges: '',
      documentationClear: '',
      dtmAvailable: '',
      englishTrouble: '',
      triedCustomOsm: '',
      facedErrors: '',
      knowWhereHelp: '',
      finishedMaps: '',
      publishedMaps: '',
      joinedDiscord: '',
      followUpdates: '',
      tutorialPreference: '',
      missingFeatures: '',
      likeMost: '',
      interfaceClear: '',
      additionalFeedback: ''
    });
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SimpleButton 
                  onClick={() => router.push('/')}
                  variant="primary"
                  className="flex-1 sm:flex-none"
                >
                  Back to Generator
                </SimpleButton>
                <SimpleButton 
                  onClick={handleReset}
                  variant="secondary"
                  className="flex-1 sm:flex-none"
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

              <SimpleRadio
                name="rating"
                label="How would you rate Maps4FS overall?"
                options={ratingOptions}
                selectedValue={surveyData.rating}
                onChange={(value) => setSurveyData(prev => ({ ...prev, rating: value }))}
                required
              />

              <SimpleRadio
                name="triedLocalDeploy"
                label="Have you tried to deploy Maps4FS locally?"
                options={yesNoOptions}
                selectedValue={surveyData.triedLocalDeploy}
                onChange={(value) => setSurveyData(prev => ({ ...prev, triedLocalDeploy: value }))}
                horizontal
              />

              {surveyData.triedLocalDeploy === 'yes' && (
                <SimpleRadio
                  name="deploySuccess"
                  label="Did you manage to deploy it successfully or faced challenges?"
                  options={deploySuccessOptions}
                  selectedValue={surveyData.deploySuccess}
                  onChange={(value) => setSurveyData(prev => ({ ...prev, deploySuccess: value }))}
                />
              )}

              {(surveyData.deploySuccess === 'challenges' || surveyData.triedLocalDeploy === 'yes') && (
                <SimpleTextInput
                  label="If you faced some challenges during local deployment, explain what was the most difficult"
                  value={surveyData.deploymentChallenges}
                  onChange={(value) => setSurveyData(prev => ({ ...prev, deploymentChallenges: value }))}
                  placeholder="Describe the main challenges you encountered..."
                  multiline
                  rows={3}
                />
              )}

              <SimpleRadio
                name="documentationClear"
                label="Is documentation clear and understandable?"
                options={yesNoOptions}
                selectedValue={surveyData.documentationClear}
                onChange={(value) => setSurveyData(prev => ({ ...prev, documentationClear: value }))}
                horizontal
              />

              <SimpleRadio
                name="dtmAvailable"
                label="Are high quality DTM providers available for your region?"
                options={yesNoOptions}
                selectedValue={surveyData.dtmAvailable}
                onChange={(value) => setSurveyData(prev => ({ ...prev, dtmAvailable: value }))}
                horizontal
              />

              <SimpleRadio
                name="englishTrouble"
                label="Do you have any difficulties with the English user interface?"
                options={yesNoOptions}
                selectedValue={surveyData.englishTrouble}
                onChange={(value) => setSurveyData(prev => ({ ...prev, englishTrouble: value }))}
                horizontal
              />

              <SimpleRadio
                name="triedCustomOsm"
                label="Have you tried using custom OSM files?"
                options={yesNoOptions}
                selectedValue={surveyData.triedCustomOsm}
                onChange={(value) => setSurveyData(prev => ({ ...prev, triedCustomOsm: value }))}
                horizontal
              />

              <SimpleRadio
                name="facedErrors"
                label="Did you face any errors or challenges that you couldn't understand?"
                options={yesNoOptions}
                selectedValue={surveyData.facedErrors}
                onChange={(value) => setSurveyData(prev => ({ ...prev, facedErrors: value }))}
                horizontal
              />

              <SimpleRadio
                name="knowWhereHelp"
                label="Do you know where to search for help?"
                options={yesNoOptions}
                selectedValue={surveyData.knowWhereHelp}
                onChange={(value) => setSurveyData(prev => ({ ...prev, knowWhereHelp: value }))}
                horizontal
              />

              <SimpleRadio
                name="finishedMaps"
                label="Did you finish any maps after using Maps4FS?"
                options={yesNoOptions}
                selectedValue={surveyData.finishedMaps}
                onChange={(value) => setSurveyData(prev => ({ ...prev, finishedMaps: value }))}
                horizontal
              />

              <SimpleRadio
                name="publishedMaps"
                label="Did you publish any maps to ModHub that were created by Maps4FS?"
                options={yesNoOptions}
                selectedValue={surveyData.publishedMaps}
                onChange={(value) => setSurveyData(prev => ({ ...prev, publishedMaps: value }))}
                horizontal
              />

              <SimpleRadio
                name="joinedDiscord"
                label="Did you join the Maps4FS Discord server?"
                options={yesNoOptions}
                selectedValue={surveyData.joinedDiscord}
                onChange={(value) => setSurveyData(prev => ({ ...prev, joinedDiscord: value }))}
                horizontal
              />

              <SimpleRadio
                name="followUpdates"
                label="Do you follow Maps4FS updates to know about the latest features?"
                options={yesNoOptions}
                selectedValue={surveyData.followUpdates}
                onChange={(value) => setSurveyData(prev => ({ ...prev, followUpdates: value }))}
                horizontal
              />

              <SimpleRadio
                name="tutorialPreference"
                label="What tutorials do you prefer?"
                options={tutorialPreferenceOptions}
                selectedValue={surveyData.tutorialPreference}
                onChange={(value) => setSurveyData(prev => ({ ...prev, tutorialPreference: value }))}
              />

              <SimpleRadio
                name="interfaceClear"
                label="Is the Maps4FS interface clear and understandable?"
                options={yesNoOptions}
                selectedValue={surveyData.interfaceClear}
                onChange={(value) => setSurveyData(prev => ({ ...prev, interfaceClear: value }))}
                horizontal
              />

              <SimpleTextInput
                label="What important features are missing in Maps4FS?"
                value={surveyData.missingFeatures}
                onChange={(value) => setSurveyData(prev => ({ ...prev, missingFeatures: value }))}
                placeholder="Tell us about features you'd like to see..."
                multiline
                rows={3}
              />

              <SimpleTextInput
                label="What do you like most about Maps4FS?"
                value={surveyData.likeMost}
                onChange={(value) => setSurveyData(prev => ({ ...prev, likeMost: value }))}
                placeholder="Share what you enjoy most..."
                multiline
                rows={3}
              />

              <SimpleTextInput
                label="Any additional feedback"
                value={surveyData.additionalFeedback}
                onChange={(value) => setSurveyData(prev => ({ ...prev, additionalFeedback: value }))}
                placeholder="Any other thoughts or suggestions..."
                multiline
                rows={4}
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