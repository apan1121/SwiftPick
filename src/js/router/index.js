import { jsVars, history_route, popup } from 'lib/common/util';
import { defineAsyncComponent } from 'vue';

import { createRouter, createWebHashHistory } from 'vue-router';


const routes = [
    {
        path: '/',
        redirect: { name: 'ParticipantList' },
    },
    // LuckyDraw pages
    {
        path: '/prizes',
        name: 'PrizeSetup',
        component: () => import('components/LuckyDraw/PrizeSetup.vue'),
        meta: { type: 'page' },
    },
    {
        path: '/participants',
        name: 'ParticipantList',
        component: () => import('components/LuckyDraw/ParticipantList.vue'),
        meta: { type: 'page' },
    },
    {
        path: '/drawing',
        name: 'DrawingBoard',
        component: () => import('components/LuckyDraw/DrawingBoard.vue'),
        meta: { type: 'page' },
    },
    {
        path: '/results',
        name: 'Results',
        component: () => import('components/LuckyDraw/Results.vue'),
        meta: { type: 'page' },
    },
];

// let referrer_url = '';

export const createRoutes = (store) => {
    const router = createRouter({
        linkActiveClass: '',
        linkExactActiveClass: 'is-active',
        history: createWebHashHistory(),
        routes,
        scrollBehavior(to, from, savedPosition){
            // // console.log(savedPosition);
            // if (savedPosition) {
            //     if (['assignment', 'assignment_landing'].includes(to.name)) {
            //         return {
            //             left: 0,
            //             top: 0,
            //         };
            //     }

            //     return savedPosition;
            // }

            // const position = {};
            // // scroll to anchor by returning the selector
            // if (to.hash) {
            //     position.el = to.hash;
            //     position.behavior = 'smooth';

            //     if (/^#\d/.test(to.hash) || document.querySelector(to.hash)) {
            //         return position;
            //     }

            //     return false;
            // }

            // return new Promise((resolve) => {
            //     // // check if any matched route config has meta that requires scrolling to top
            //     // if (to.matched.some((m) => m.meta.scrollToTop)) {
            //     //     // coords will be used if no selector is provided,
            //     //     // or if the selector didn't match any element.
            //     //     position.left = 0;
            //     //     position.top = 0;
            //     // }

            //     if (!['general', 'articles'].includes(to.name)) {
            //         position.left = 0;
            //         position.top = 0;
            //     }

            //     resolve(position);
            // });
        },
    });

    router.beforeEach(async (to, from) => {
        // Basic guards for LuckyDraw flow
        const getters = store.getters || {};
        if (to.name === 'DrawingBoard') {
            const hasPrizes = (getters.totalPrizeQuantity || 0) > 0;
            const hasParticipants = (getters.totalParticipants || 0) > 0;
            if (!hasPrizes) return { name: 'PrizeSetup' };
            if (!hasParticipants) return { name: 'ParticipantList' };
        }
        return true;
    });

    router.afterEach((to, from, failure) => {
        // // if (!mobile_app.isMobileApp()) {
        // if (!!referrer_url) {
        //     window.resetReferrerUrl(referrer_url);
        // }
        // referrer_url = window.location.href;

        // // ppPanel pageView setting
        // ppPanel.pageView(`${to.meta.type}_${to.name}`, {
        //     ...to.params,
        //     ...to.query,
        // });

        // trackJS.mkgEventAction('page_view', '', {});
        // // }
    });

    return router;
};

export default {};
