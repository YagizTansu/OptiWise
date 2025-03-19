import React from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Legal.module.css';

export default function TermsAndConditions() {
  return (
    <Layout title="Terms and Conditions | OptiWise">
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Terms and Conditions</h1>
          
          <div className={styles.content}>
            <section className={styles.section}>
              <h2>Introduction</h2>
              <p>
                These Terms and Conditions ("Terms") govern your access to and use of the OptiWise website and services ("Service"). Please read these Terms carefully before using our Service. By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Definitions</h2>
              <p>
                <strong>"Company"</strong> refers to OptiWise Ltd., located in Zurich, Switzerland.
              </p>
              <p>
                <strong>"Service"</strong> refers to the website, applications, tools, and features provided by OptiWise.
              </p>
              <p>
                <strong>"User"</strong> refers to individuals who access or use the Service.
              </p>
              <p>
                <strong>"Account"</strong> refers to a registered user profile on our Service.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Account Registration</h2>
              <p>
                To access certain features of the Service, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Service Usage</h2>
              <p>
                The Service is provided for informational and educational purposes only. You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul>
                <li>Use the Service in any way that violates any applicable law or regulation</li>
                <li>Attempt to interfere with or disrupt the operation of the Service</li>
                <li>Engage in any data mining, scraping, or similar data gathering activities</li>
                <li>Use the Service to transmit any malware, viruses, or other harmful code</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Use the Service to impersonate another person or entity</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by OptiWise and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Service, except as permitted by these Terms or with our prior written consent.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Subscription and Fees</h2>
              <p>
                Some aspects of the Service may be offered on a subscription basis. By selecting a subscription plan, you agree to pay the fees associated with that plan. All fees are non-refundable unless otherwise specified or required by applicable law.
              </p>
              <p>
                We reserve the right to change our subscription fees at any time, upon reasonable notice. If you do not agree to any fee changes, you have the right to cancel your subscription before the changes take effect.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, in no event shall OptiWise, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless OptiWise and its licensees and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses, resulting from or arising out of your use of the Service.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of Switzerland, without regard to its conflict of law provisions. Any disputes relating to these Terms shall be subject to the exclusive jurisdiction of the courts of Zurich, Switzerland.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              <p>
                By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at legal@optiwise.ai.
              </p>
            </section>
          </div>
        </main>
      </div>
    </Layout>
  );
}
