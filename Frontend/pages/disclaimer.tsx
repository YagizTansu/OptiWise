import React from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Legal.module.css';

export default function Disclaimer() {
  return (
    <Layout title="Disclaimer | OptiWise">
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Disclaimer</h1>
          
          <div className={styles.content}>
            <section className={styles.section}>
              <h2>General Disclaimer</h2>
              <p>
                The information provided on OptiWise is for general informational purposes only. All information on the site is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Financial Disclaimer</h2>
              <p>
                The content available on OptiWise is not intended to be financial advice. Any reliance you place on such information is strictly at your own risk. We strongly recommend consulting with a professional financial advisor before making any financial decisions. The financial tools and calculators provided are for educational and illustrative purposes only.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Investment Risk Disclaimer</h2>
              <p>
                Investments involve risk, and past performance is not indicative of future results. OptiWise does not guarantee any specific outcome or profit. Users should be aware that investments can lose value and that they should invest only what they are willing to lose.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites or services that are not owned or controlled by OptiWise. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We do not warrant the offerings of any of these entities/individuals or their websites.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Accuracy of Information</h2>
              <p>
                While we strive to provide accurate and up-to-date information, OptiWise makes no warranties or representations regarding the accuracy or completeness of the information. We assume no liability or responsibility for any errors or omissions in the content of our site.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Changes to Disclaimer</h2>
              <p>
                OptiWise reserves the right to modify this disclaimer at any time. We encourage users to frequently check this page for any changes. You acknowledge and agree that it is your responsibility to review this disclaimer periodically and become aware of modifications.
              </p>
            </section>
          </div>
        </main>
      </div>
    </Layout>
  );
}
