import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import {config} from 'dotenv';
config();

const environment = process.env.ENVIRONMENT;
const apiUrl = environment === 'development' ? process.env.URL_TEST : process.env.URL_PROD;
const authToken = environment === 'development' ? process.env.AUTH_TOKEN_TEST : process.env.AUTH_TOKEN_PROD;

const app = express();

app.use(express.json())
app.use(cors());

app.post("/PixController", async (req, res) => {
  console.log(environment, apiUrl, authToken)
  const { user } = req.body;
  const today = new Date();
  const expiredDateTimeStamp = today.setDate(today.getDate() + 1);
  const expiredDate = new Date(expiredDateTimeStamp).toISOString();
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      reference_id: "ex-00001",
      customer: {
        name: user.name,
        email: user.email,
        tax_id: "12345678909",
        phones: [
          {
            country: "55",
            area: user.cellphone.area,
            number: user.cellphone.number,
            type: "MOBILE",
          },
        ],
      },
      items: [
        {
          name: "video do jogo",
          quantity: 1,
          unit_amount: 2000,
        },
      ],
      qr_codes: [
        {
          amount: {
            value: 2000,
          },
          expiration_date: expiredDate,
        },
      ],
      shipping: null,
      notification_urls: [],
    }),
  });
  const data = await response.json();
  res.send({ data });
  // res.send({ customer: data.customer, href: data["qr_codes"][0].links[0].href, text: data["qr_codes"][0].text });
});

app.post("/CreditCardController", async (req, res) => {
  const { user, creditCard } = req.body;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      reference_id: "ex-00001",
      customer: {
        name: user.name,
        email: user.email,
        tax_id: "12345678909",
        phones: [
          {
            country: "55",
            area: user.cellphone.area,
            number: user.cellphone.number,
            type: "MOBILE",
          },
        ],
      },
      items: [
        {
          name: "video",
          quantity: 1,
          unit_amount: 2000,
        },
      ],
      charges: [
        {
          reference_id: "video_do_jogo",
          description: "video do jogo",
          amount: {
            value: 2000,
            currency: "BRL",
          },
          payment_method: {
            type: "CREDIT_CARD",
            installments: 1,
            capture: true,
            card: {
              number: creditCard.number,
              exp_month: creditCard.expiredMonth,
              exp_year: creditCard.expiredYear,
              security_code: creditCard.securityCode,
              holder: {
                name: creditCard.cardName
              },
              store: false,
            },
          }
        },
      ],
      shipping: null,
      notification_urls: [],
    }),
  });
  const data = await response.json();
  res.send(data);
});

app.listen("3001", () => {
  console.log("Server listening on port 3001!");
});
