const path = require('path');

module.exports = {
    entry: {
        main: "./react/src/app.jsx",
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/env', '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
        ],
    },
    
	optimization: {
    	minimizer: [new TerserPlugin({
			extractComments: false,
			// terserOptions: {
        	// 	format: {
	        //   		comments: false,
        	// 	},
      		// },
    	})],
	},
    
    
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "assets/built"),
    },
};
