<template>
  <div class="prose dark:prose-invert max-w-none">
    <h1>Privacy Policy</h1>
    <p>Last updated: {{ new Date().toLocaleDateString() }}</p>

    <h2>1. Information We Collect</h2>
    <p>When you use our service, we collect:</p>
    <ul>
      <li>Your GitHub username and profile information (when you log in)</li>
      <li>Essays you generate using our service</li>
      <li>Usage data to improve our service</li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <p>We use the collected information to:</p>
    <ul>
      <li>Provide and maintain our service</li>
      <li>Improve user experience</li>
      <li>Contact you regarding your account or service updates</li>
      <li>Send you important notifications about our service or other related information</li>
    </ul>

    <h2>3. Data Storage and Security</h2>
    <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>

    <h2>4. Your Rights</h2>
    <p>You have the right to:</p>
    <ul>
      <li>Access your personal data</li>
      <li>Request deletion of your data</li>
      <li>Opt-out of communications</li>
    </ul>

    <h2>5. Contact Us</h2>
    <p>If you have any questions about this Privacy Policy, please contact us through GitHub or email (george.strakhov[at]gmail.com)</p>

    <h2>6. Changes to This Policy</h2>
    <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script> 