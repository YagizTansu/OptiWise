import React from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Legal.module.css';

export default function PrivacyPolicy() {
  return (
    <Layout title="Privacy Policy | OptiWise">
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Privacy Policy</h1>
          
          <div className={styles.content}>
            <section className={styles.section}>
              <h2>Introduction</h2>
              <p>
                This Privacy Policy describes how OptiWise Ltd. ("OptiWise," "we," "us," or "our") collects, uses, and discloses your personal information when you visit our website, use our services, or otherwise interact with us. We are committed to protecting your personal information and your right to privacy.
              </p>
              <p>
                This policy applies to all information collected through our website, mobile application, and any related services, sales, marketing, or events (collectively, the "Services").
              </p>
            </section>

            <section className={styles.section}>
              <h2>Information We Collect</h2>
              <p>
                We collect personal information that you voluntarily provide when you register for our Services, express interest in obtaining information about us or our products, or otherwise contact us.
              </p>
              <p>
                The personal information we collect may include:
              </p>
              <ul>
                <li>Contact information (name, email address, phone number)</li>
                <li>Account credentials (username, password)</li>
                <li>Financial information (investment preferences, portfolio data)</li>
                <li>Profile information (investment goals, risk tolerance)</li>
                <li>Usage data (how you interact with our Services)</li>
                <li>Device information (IP address, browser type, operating system)</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>How We Use Your Information</h2>
              <p>
                We use the information we collect for various purposes, including:
              </p>
              <ul>
                <li>Providing, operating, and maintaining our Services</li>
                <li>Improving and personalizing our Services</li>
                <li>Understanding how users interact with our Services</li>
                <li>Developing new products, services, and features</li>
                <li>Communicating with you about our Services, updates, and other information</li>
                <li>Preventing fraud and abuse of our Services</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>Information Sharing</h2>
              <p>
                We may share your information with:
              </p>
              <ul>
                <li><strong>Service Providers:</strong> Third-party vendors who help us provide and improve our Services</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition of all or a portion of our business</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>With Your Consent:</strong> When you have explicitly agreed to the sharing of your data</li>
              </ul>
              <p>
                We do not sell or rent your personal information to third parties.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Data Security</h2>
              <p>
                We have implemented appropriate technical and organizational security measures to protect your personal information from accidental loss, unauthorized access, use, alteration, and disclosure. However, please note that no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Data Retention</h2>
              <p>
                We will retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements. When determining the appropriate retention period, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorized use or disclosure, and the applicable legal requirements.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Your Privacy Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul>
                <li>Access to your personal information</li>
                <li>Correction of inaccurate or incomplete information</li>
                <li>Deletion of your personal information</li>
                <li>Restriction or objection to our processing of your information</li>
                <li>Data portability</li>
                <li>Withdrawal of consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us at privacy@optiwise.ai.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Children's Privacy</h2>
              <p>
                Our Services are not directed to children under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Third-Party Links and Services</h2>
              <p>
                Our Services may contain links to third-party websites, services, or applications that are not operated by us. We have no control over and assume no responsibility for the privacy practices of third parties. We encourage you to review the privacy policies of any third-party services you access.
              </p>
            </section>

            <section className={styles.section}>
              <h2>International Data Transfers</h2>
              <p>
                Your information may be transferred to, and processed in, countries other than the country in which you reside. These countries may have data protection laws that are different from those in your country. Whenever we transfer your information, we take steps to ensure that adequate safeguards are in place to protect your information and to ensure it is treated in accordance with this Privacy Policy.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Updates to this Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. When we make material changes to this Privacy Policy, we will notify you by email or through a notice on our website prior to the changes becoming effective.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p>
                OptiWise Ltd.<br />
                Zurich, Switzerland<br />
                Email: privacy@optiwise.ai
              </p>
            </section>
          </div>
        </main>
      </div>
    </Layout>
  );
}
