import router from "../router";
import axios from "axios";
import Vue from "vue";
import VueCookies from "vue-cookies";

export const get = async (url, name, params) => {
  Vue.$gtag.event(`gnm_pref_pc`, {
    event_category: "api-get",
    event_label: name,
    value: 1,
  });
  return axios
    .create({
      responseType: "json",
      baseURL: url,
    })
    .get(name, {
      params,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": "yzkQpdAiAT1mzThZzX6U54vnTuo9GgWQ3N9xOBy3",
      },
    })
    .then((response) => {
      return [null, response.data];
    })
    .catch((err) => {
      if (window.location.origin.indexOf("http://localhost") === -1) {
        if (err.response.status === 403) {
          if (router.currentRoute.path === "/analysis") {
            window.close();
          }
          // window.location.href = window.location.origin;
          window.location.href = window.location.origin + "/login";
        }
      } else {
        return [err];
      }
    });
};

export const mobileApiGet = async (url, name, params) => {
  Vue.$gtag.event(`gnm_pref_pc`, {
    event_category: "api-get",
    event_label: name,
    value: 1,
  });
  const token =
      VueCookies.get("access_token");
  return axios
      .create({
        responseType: "json",
        baseURL: url,
      })
      .get(name, {
        params,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-api-key": "yzkQpdAiAT1mzThZzX6U54vnTuo9GgWQ3N9xOBy3",
          "x-auth-token": token,
        },
      })
      .then((response) => {
        return [null, response.data];
      })
      .catch((err) => {
        if (window.location.origin.indexOf("http://localhost") === -1) {
          if (err.response.status === 403) {
            if (router.currentRoute.path === "/analysis") {
              window.close();
            }
            // window.location.href = window.location.origin;
            window.location.href = window.location.origin + "/login";
          }
        } else {
          return [err];
        }
      });
};

export const post = async (url, name, params) => {
  return axios
    .create({
      responseType: "json",
      baseURL: url,
    })
    .post(name, params)
    .then((response) => {
      return [null, response.data];
    })
    .catch((err) => {
      if (window.location.origin.indexOf("http://localhost") === -1) {
        if (err.response.status === 403) {
          // window.location.href = window.location.origin;
          window.location.href = window.location.origin + "/login";
        }
      } else {
        return [err];
      }
    });
};
