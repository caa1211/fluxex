var React = require('react');
var Fluxex = require('fluxex');
var Product = require('./Product.jsx');
var sampleActions = require('../actions/sample');

var Html = React.createClass({
    mixins: [
        Fluxex.mixin
    ],

    componentDidMount: function () {
        /*global window,document*/
        var blockDoublePop = (document.readyState != 'complete'),
            initState = this._getContext().toString(),
            initUrl = window.location.href;

        if (!window.addEventListener) {
            return;
        }

        if (!window.history.pushState) {
            return;
        }

        window.addEventListener('load', function() {
            setTimeout(function () {
                blockDoublePop = false;
            }, 1);
        });

        window.addEventListener('popstate', function (E) {
            var state = E.state || ((window.location.href === initUrl) ? initState : undefined);

            if (blockDoublePop && (document.readyState === 'complete')) {
                return;
            }

            if (!state) {
                return console.log('NO STATE DATA....can not handle re-rendering');
            }

            // Ya, trigger page restore by an anonymous action
            this.executeAction(function () {
                this._restore(JSON.parse(state));
                this.getStore('productStore').emitChange();
                this.getStore('page').emitChange();
                return Promise.resolve(true);
            }.bind(this._getContext()));
        }.bind(this));
    },

    handleClickLink: function (E) {
        var HREF = E.target.href,
            CX = this._getContext();

        if (!window.history.pushState) {
            return;
        }

        if (!HREF || HREF.match(/#/)) {
            return;
        }

        E.preventDefault();
        E.stopPropagation();

        // Go to the url
        CX.dispatch('UPDATE_URL', HREF).then(function () {
            // Run action to update page stores
            return this.executeAction(sampleActions.updateProductPage);
        }.bind(CX)).then(function () {
            // Success, update url to history
            /*global history*/
            history.pushState(CX.toString(), undefined, HREF);
        }.bind(CX));
    },

    render: function () {
        return (
        <html>
         <head>
          <meta charSet="utf-8" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="viewport" content="width=device-width, user-scalable=no" />
          <Fluxex.Title />
         </head>
         <body onClick={this.handleClickLink}>
          <div>
           <Product />
          </div>
          <Fluxex.InitScript />
         </body>
        </html> 
        );
    }
});

module.exports = Html;
