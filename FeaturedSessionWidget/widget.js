// import another custom element that handles a portion of the UI
// NOTE: this import must include the file extension
import { FeaturedSession } from "./components/FeaturedSession.js";

export default class extends HTMLElement {
  images = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/PitbullHWOFMay2013.jpg/220px-PitbullHWOFMay2013.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/f/f8/Ken-Thompson-2019.png",
    "https://www.cvent.com/sites/default/files/styles/focus_scale_and_crop_300x300/public/image/2018-01/reggie-aggarwal-thumb.jpg",
  ];

  constructor({ configuration, theme }) {
    super();
    // store theme and configuration for later use
    this.configuration = configuration || {};
    this.theme = theme;

    // Create a shadow root
    this.attachShadow({ mode: "open" });

    // a naming collision with any other custom element on the page
    // (e.g. from having two copies of this widget) would cause an error
    if (!customElements.get("namespace-featured-session")) {
      // define a custom element that we will use to display each featured session
      customElements.define("namespace-featured-session", FeaturedSession, {
        extends: "div",
      });
    }
  }

  async connectedCallback() {
    // container for the featured session cards
    const featuredSessionContainer = document.createElement("div");
    featuredSessionContainer.style.display = "flex";
    featuredSessionContainer.style.width = "100%";

    // placeholder so that our element doesn't render without height in the editor before we've added sessions
    const placeholderDiv = document.createElement("div");
    placeholderDiv.style.height = "200px";
    placeholderDiv.style.width = "0px";
    featuredSessionContainer.appendChild(placeholderDiv);

    //get our array of featured session ids
    const featuredSessionIds = this.configuration.featuredSessionIds ?? [];

    // create our session generator
    const sessionGenerator = await this.getSessionGenerator("dateTimeDesc", 20);
    const sessions = [];

    // iterate over the generator to get all of our sessions
    for await (const page of sessionGenerator) {
      sessions.push(...page.sessions);
    }

    this.sessionDetails = sessions;

    //create a featured session card for each featured session using  our accessory custom element and session detail information
    featuredSessionIds.forEach((featuredSessionId) => {
      const featuredSession = sessions.find(
        (session) => session.id === featuredSessionId
      );

      if (featuredSession) {
        featuredSessionContainer.appendChild(
          new FeaturedSession(
            featuredSession,
            this.theme,
            this.configuration,
            this.images.pop()
          )
        );
      }
    });

    this.shadowRoot.appendChild(featuredSessionContainer);
  }
}
