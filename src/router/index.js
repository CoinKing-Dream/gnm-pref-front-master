import Vue from "vue";
import Router from "vue-router";
import Dashboard from "../pages/dashboard/Dashboard";
import TestChartList from "@/pages/TestChartList";
import Analysis from "../pages/analysis/Analysis";
import TsTable from "@/pages/TsTable";
import Download from "@/pages/dashboard/Download";

Vue.use(Router);

export default new Router({
  beforeEnter: (to, from, next) => {
    let accessToken = Vue.cookie.get('access_token')
    let userId = Vue.cookie.get('userId')
    if (!accessToken || !userId) {
      // user doesn't have access token, redirect to login
      next({ name: 'login' })
    }
    else {
      // user has access token, user can open the page
      next()
    }
  },
  routes: [
    {
      path: "/dashboard",
      component: Dashboard
    },
    {
      path: "/analysis",
      component: Analysis
    },
    {
      path: "/ts-table",
      component: TsTable
    },
    {
      path: "/test",
      component: TestChartList
    },
    {
      path: "/download",
      component: Download
    },
    {
      path: "/*",
      component: Dashboard
    }
  ]
});
