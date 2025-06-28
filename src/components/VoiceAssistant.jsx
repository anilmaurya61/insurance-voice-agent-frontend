import React, { useRef, useState } from 'react';
import {
  checkUserSelection,
  getPlanDetails,
  getRecommendedRiders,
  saveUserSelection
} from '../services/api';
import { speak, listen } from '../utils/speech';
import ListeningIndicator from './ListeningIndicator';

const VoiceAssistant = () => {
  const outputRef = useRef(null);
  const listeningRef = useRef(null);
  const [disabled, setDisabled] = useState(false);

  const getValidResponse = async (promptText, validOptions, errorPrompt = "Sorry, I didn't understand. Please try again.") => {
    while (true) {
      await speak(promptText, outputRef);
      const response = await listen("", 2, outputRef, listeningRef);
      const matched = validOptions.find(opt => response.includes(opt.toLowerCase()));
      if (matched) return matched;
      await speak(errorPrompt, outputRef);
    }
  };

  const getValidAge = async () => {
    while (true) {
      const ageResponse = await listen("Please tell me your age.", 2, outputRef, listeningRef);
      const age = parseInt(ageResponse.match(/\d+/)?.[0]);
      if (age > 0 && age < 120) return age;
      await speak("That doesn't seem like a valid age. Please say a number between 1 and 120.", outputRef);
    }
  };

  const startAssistant = async () => {
    setDisabled(true);
    try {
      await speak("Hi! Please say your name or user ID to begin.", outputRef);
      const userIdRaw = await listen("Please say your name or user ID.", 2, outputRef, listeningRef);
      const userId = userIdRaw.replace(/\s+/g, '-').toLowerCase();

      const { data: existing } = await checkUserSelection(userId);

      if (existing?.policy) {
        await speak(`You previously selected the ${existing.policy} plan with riders: ${existing.riders?.join(", ") || "none"} at age ${existing.age}. Would you like to update it?`, outputRef);
        const updateResp = await getValidResponse("Would you like to update your selection?", ["yes", "no"]);
        if (updateResp !== "yes") {
          await speak("Okay, keeping your current selection. Thank you!", outputRef);
          setDisabled(false);
          return;
        }
      }

      const planType = await getValidResponse("Would you like to hear about our Silver or Gold health insurance plan?", ["silver", "gold"]);
      const { data: plan } = await getPlanDetails(planType);

      await speak(`${planType} plan includes sum insured of ${plan.sumInsured}, premium of ${plan.premium}. Features: ${plan.features.split(',').join(", ")}. Please tell me your age.`, outputRef);

      const age = await getValidAge();

      const { data: riderData } = await getRecommendedRiders(age);
      const riderList = riderData.recommendedRiders;

      let selectedRiders = [];
      while (selectedRiders.length === 0) {
        await speak(`Based on your age, we recommend: ${riderList.join(", ")}. Please say one or more riders.`, outputRef);
        const selectedRes = await listen("Please name one or more riders.", 2, outputRef, listeningRef);
        selectedRiders = riderList.filter(r => selectedRes.includes(r.toLowerCase()));
        if (selectedRiders.length === 0) {
          await speak("I couldn't match any rider from your response. Please try again.", outputRef);
        }
      }

      await speak(`You've selected the ${planType} plan and riders: ${selectedRiders.join(", ")}. Saving your selection now.`, outputRef);

      await saveUserSelection({ userId, policy: planType, riders: selectedRiders, age });
      await speak("Your selection has been saved. Thank you!", outputRef);
    } catch (err) {
      console.error(err);
      await speak("Sorry, something went wrong.", outputRef);
    }
    setDisabled(false);
  };

  return (
    <div>
      <h1>Welcome to Policy Voice Assistant</h1>
      <button onClick={startAssistant} disabled={disabled}>Start Talking</button>
      <div ref={outputRef}></div>
      <div ref={listeningRef}><ListeningIndicator /></div>
    </div>
  );
};

export default VoiceAssistant;
