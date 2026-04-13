import dotenv from "dotenv";
dotenv.config();

export default {
    datasource: {
        provider: "postgresql",
        url: process.env.DATABASE_URL,
    },
};
