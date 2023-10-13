import { Button } from "flowbite-react";
import { Fragment, FunctionComponent, useCallback } from "react";

import AccountingImage from "./_images/accounting.png";
import GraphQLImgae from "./_images/graphql.png";
import SenyumMobileImage from "./_images/senyum-mobile.png";

const Home: FunctionComponent = () => {
  const handleNavigateToContact = useCallback(() => {
    const contactEl = document.getElementById("contact");
    contactEl?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleNavigateToWorks = useCallback(() => {
    const contactEl = document.getElementById("my-works");
    contactEl?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <Fragment>
      <div className="py-10 px-4 md:p-20 rounded-lg bg-gray-100" id="about">
        <span className="font-bold text-3xl lg:text-4xl block mb-4">
          Hello, I am Pradipta Agus
        </span>
        <span className="text-xl lg:text-2xl max-w-xl block mb-4">
          a fullstack developer, passionate about programming and very
          interested in and keep learning new technologies. ❤️ beautiful code.
        </span>
        <div className="flex gap-2">
          <Button size="xl" onClick={handleNavigateToWorks}>
            My works
          </Button>
          <Button size="xl" onClick={handleNavigateToContact}>
            Let&apos;s work together
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-5 pt-10 px-4 lg:px-0" id="my-works">
        <h1 className="text-4xl font-bold mb-4">My Works</h1>
        <div className="border rounded-lg overflow-hidden shadow-lg">
          <img
            src={SenyumMobileImage}
            alt="SenyuM Mobile"
            width="100%"
            height="500"
          />
          <div className="px-4 pb-4 py-5">
            <a
              href="https://play.google.com/store/apps/details?id=com.senyum&output=embed"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              <h2 className="font-bold text-2xl mb-3">SenyuM Mobile</h2>
            </a>
            <p className="mb-4">
              The SenyuM (Sentra Layanan Ultra Micro or Ultra Micro Service
              Center) Mobile application is a form of synergy of the Indonesian
              ultra micro holding which consists of BRI, Pegadaian and
              Permodalan Nasional Madani (PNM). SenyuM Mobile can make it easier
              for people to open savings, refer loans and enjoy a variety of
              financial products and services from the three companies according
              to their respective needs.
            </p>
            <p className="mb-4">
              The products available at SenyuM Mobile are as follows:
            </p>
            <ol className="list-decimal list-inside mb-4">
              <li>Opening a UMi Simpedes Account</li>
              <li>Opening, selling and buying Pegadaian Gold Savings</li>
              <li>BRI Loan Referral</li>
              <li>Mekaar Loan Referral</li>
              <li>Pawnshop Referral</li>
            </ol>
            <div className="font-bold text-xl">Techstack</div>
            <ul className="list-disc list-inside">
              <li>Node JS</li>
              <li>Javascript</li>
              <li>Typescript</li>
              <li>React Native</li>
              <li>Java</li>
              <li>Android</li>
              <li>Redux</li>
            </ul>
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden shadow-lg">
          <iframe
            src="https://alambeanspice.com/"
            title="Alam Bean Spice"
            width="100%"
            height="500"
          ></iframe>
          <div className="px-4 pb-4 py-5">
            <a
              href="https://alambeanspice.com/"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              <h2 className="font-bold text-2xl mb-3">Alam Bean Spice</h2>
            </a>
            <p className="mb-4">
              The Alam Bean Spice is a company profile which shows the
              information about the Alam Bean Spice&apos;s company. Furthermore,
              it provide the user to make a direct order to purchase their
              products, which authentic Vanilla and Coffee.
            </p>
            <div className="font-bold text-xl">Techstack</div>
            <ul className="list-disc list-inside">
              <li>Node JS</li>
              <li>Express JS</li>
              <li>Sequelize JS</li>
              <li>MySQL</li>
              <li>HTML</li>
              <li>CSS</li>
              <li>Javascript</li>
            </ul>
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden shadow-lg">
          <img src={GraphQLImgae} alt="GraphQL" width="100%" height="500" />
          <div className="px-4 pb-4 py-5">
            <a
              href="https://github.com/pradiptaagus/graphql-project"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              <h2 className="font-bold text-2xl mb-3">GraphQL Project</h2>
            </a>
            <p className="mb-4">
              A hobby project about create GraphQL server. Here i was learned
              about authentication, query, and mutation using GraphQL.
            </p>
            <div className="font-bold text-xl">Techstack</div>
            <ul className="list-disc list-inside">
              <li>Node JS</li>
              <li>Express JS</li>
              <li>TypeORM</li>
              <li>MySQL</li>
              <li>GraphQL</li>
            </ul>
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden shadow-lg">
          <img
            src={AccountingImage}
            alt="Accounting"
            width="100%"
            height="500"
          />
          <div className="px-4 pb-4 py-5">
            <a
              href="https://github.com/pradiptaagus/accounting"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              <h2 className="font-bold text-2xl mb-3">POS Project</h2>
            </a>
            <p className="mb-4">
              A hobby project about create POS (Point of Sales) using PHP. Here
              i was learned about CRUD (Create, Read, Update, Delete) using PHP.
            </p>
            <div className="font-bold text-xl">Techstack</div>
            <ul className="list-disc list-inside">
              <li>PHP</li>
              <li>Javascript</li>
              <li>CSS</li>
              <li>HTML</li>
            </ul>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Home;
