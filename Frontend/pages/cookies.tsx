import React from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Legal.module.css';

export default function CookiePolicy() {
  return (
    <Layout title="Cookie Policy | OptiWise">
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Cookie Policy</h1>
          
          <div className={styles.content}>
            <section className={styles.section}>
              <h2>Introduction</h2>
              <p>
                This Cookie Policy explains how OptiWise Ltd. ("OptiWise," "we," "us," or "our") uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
              </p>
            </section>

            <section className={styles.section}>
              <h2>What are Cookies?</h2>
              <p>
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>
              <p>
                Cookies set by the website owner (in this case, OptiWise) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Why Do We Use Cookies?</h2>
              <p>
                We use cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies enable us to track and target the interests of our users to enhance the experience on our website. Third parties serve cookies through our website for advertising, analytics, and other purposes. This is described in more detail below.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Types of Cookies We Use</h2>
              <p>
                The specific types of first and third-party cookies served through our website and the purposes they perform are described below:
              </p>
              <p>
                <strong>Essential Cookies:</strong> These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the website, you cannot refuse them without impacting how our website functions.
              </p>
              <p>
                <strong>Performance and Functionality Cookies:</strong> These cookies are used to enhance the performance and functionality of our website but are non-essential to its use. However, without these cookies, certain functionality may become unavailable.
              </p>
              <p>
                <strong>Analytics and Customization Cookies:</strong> These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you.
              </p>
              <p>
                <strong>Advertising Cookies:</strong> These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in some cases selecting advertisements that are based on your interests.
              </p>
              <p>
                <strong>Social Media Cookies:</strong> These cookies are used to enable you to share pages and content that you find interesting on our website through third-party social networking and other websites. These cookies may also be used for advertising purposes.
              </p>
            </section>

            <section className={styles.section}>
              <h2>How Can You Control Cookies?</h2>
              <p>
                You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted. As the means by which you can refuse cookies through your web browser controls vary from browser to browser, you should visit your browser's help menu for more information.
              </p>
              <p>
                In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would like to find out more information, please visit <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">http://www.aboutads.info/choices/</a> or <a href="http://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer">http://www.youronlinechoices.com</a>.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Cookie Preferences</h2>
              <p>
                When you first visit our website, we may ask you for your consent to use cookies via a cookie consent banner. You may choose to consent to our use of all cookies, only cookies that are essential to the operation of the website, or no cookies (except for strictly necessary cookies).
              </p>
              <p>
                You can also adjust your cookie preferences by clicking on "Cookie Settings" in the footer of our website at any time.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Cookies Used on Our Website</h2>
              <p>
                The table below provides more information about the specific cookies we use and the purposes for which we use them:
              </p>
              <table className={styles.cookieTable}>
                <thead>
                  <tr>
                    <th>Cookie Name</th>
                    <th>Provider</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>_session</td>
                    <td>OptiWise</td>
                    <td>Used to maintain user session state</td>
                    <td>Session</td>
                  </tr>
                  <tr>
                    <td>_optiwise_auth</td>
                    <td>OptiWise</td>
                    <td>Authentication cookie to identify logged-in users</td>
                    <td>30 days</td>
                  </tr>
                  <tr>
                    <td>_ga</td>
                    <td>Google Analytics</td>
                    <td>Used to distinguish users for analytics purposes</td>
                    <td>2 years</td>
                  </tr>
                  <tr>
                    <td>_gid</td>
                    <td>Google Analytics</td>
                    <td>Used to distinguish users for analytics purposes</td>
                    <td>24 hours</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className={styles.section}>
              <h2>Changes to This Cookie Policy</h2>
              <p>
                We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
              </p>
              <p>
                The date at the bottom of this Cookie Policy indicates when it was last updated.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Contact Us</h2>
              <p>
                If you have any questions about our use of cookies or other technologies, please contact us at:
              </p>
              <p>
                OptiWise Ltd.<br />
                Zurich, Switzerland<br />
                Email: privacy@optiwise.ai
              </p>
            </section>
            
            <p className={styles.lastUpdated}>Last updated: July 1, 2023</p>
          </div>
        </main>
      </div>
    </Layout>
  );
}
