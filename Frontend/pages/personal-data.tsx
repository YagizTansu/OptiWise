import React from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Legal.module.css';

export default function PersonalDataProcessing() {
  return (
    <Layout title="Personal Data Processing | OptiWise">
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Personal Data Processing</h1>
          
          <div className={styles.content}>
            <section className={styles.section}>
              <h2>Introduction</h2>
              <p>
                This Personal Data Processing policy outlines how OptiWise collects, uses, stores, and protects your personal information. We are committed to protecting your privacy and handling your data in a transparent and secure manner in accordance with applicable data protection laws, including the General Data Protection Regulation (GDPR) where applicable.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Data Controller</h2>
              <p>
                OptiWise Ltd., located in Zurich, Switzerland, acts as the data controller for personal information collected through our website and services. If you have any questions about our data practices, please contact us at privacy@optiwise.ai.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Information We Collect</h2>
              <p>
                We collect the following categories of personal information:
              </p>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
                <li><strong>Profile Information:</strong> Optional information you provide in your user profile</li>
                <li><strong>Financial Information:</strong> Information about your portfolio, investment preferences, and risk tolerance</li>
                <li><strong>Usage Data:</strong> Information about how you use our services, including log data and analytics</li>
                <li><strong>Communication Data:</strong> Records of your communications with us</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>How We Use Your Data</h2>
              <p>
                We process your personal data for the following purposes:
              </p>
              <ul>
                <li>To provide and maintain our services</li>
                <li>To create and manage your account</li>
                <li>To provide portfolio optimization recommendations</li>
                <li>To improve and personalize your experience</li>
                <li>To communicate with you about your account or our services</li>
                <li>To comply with legal obligations</li>
                <li>To detect, prevent, and address technical or security issues</li>
              </ul>
              <p>
                We process your data based on the following legal grounds: contract performance, legitimate interests, legal obligations, and your consent where applicable.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Data Retention</h2>
              <p>
                We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, regulatory, accounting, or reporting requirements. After such time, we will securely delete or anonymize your data.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. These measures include encryption, access controls, regular security assessments, and staff training.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Data Sharing</h2>
              <p>
                We may share your personal information with:
              </p>
              <ul>
                <li>Service providers who assist us in operating our platform</li>
                <li>Professional advisors such as lawyers, auditors, and insurers</li>
                <li>Regulatory authorities, law enforcement, and other public bodies when required by law</li>
              </ul>
              <p>
                We require all third parties to respect the security of your personal data and to treat it in accordance with applicable laws.
              </p>
            </section>

            <section className={styles.section}>
              <h2>International Transfers</h2>
              <p>
                Some of our external third-party service providers may be based outside your country, which means your personal data may be transferred to and processed in countries with different data protection laws. When we do so, we ensure appropriate safeguards are in place to protect your information.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Your Data Protection Rights</h2>
              <p>
                Depending on your location, you may have the following rights regarding your personal data:
              </p>
              <ul>
                <li>Right to access your personal data</li>
                <li>Right to rectify inaccurate personal data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at privacy@optiwise.ai. We will respond to your request within the timeframe required by applicable law.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Cookies and Similar Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to collect and use personal information about you and to improve your experience on our platform. For detailed information about the types of cookies we use and how to control them, please see our Cookie Policy.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Changes to This Policy</h2>
              <p>
                We may update this Personal Data Processing policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes through our website or by other means before the changes take effect.
              </p>
            </section>
          </div>
        </main>
      </div>
    </Layout>
  );
}
