'use strict';

var yql = require('../services/yql');

module.exports = {
    search: function (payload) {
        var p = payload.p * 1 || 0,
            start = p * 10;

        if (!payload.q) {
            return this.resovePromise({});
        }

        return yql('SELECT * FROM search.ec (' + start + ', 10) WHERE keyword="' + payload.q + '" and property="shopping"').then(function (O) {
            console.log(O);
        });
    }
};