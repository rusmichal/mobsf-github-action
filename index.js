const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require("form-data");

function run() {
	try {
		const apiToken = core.getInput('MOBSF_API_TOKEN', { required: true });
		const mobsfApiUrl = core.getInput('MOBSF_API_URL', { required: true });
		const artifactPath = core.getInput('ARTIFACT_PATH', { required: true });

		// Determine content-length for header to upload asset
		const contentLength = fs.statSync(artifactPath).size;
		const fileStream = fs.createReadStream(artifactPath);

		const form = new FormData();
		form.append('file', fileStream);

		const headers = { 'Authorization': apiToken, 'content-length': contentLength };

		const response = await fetch(mobsfApiUrl + '/api/v1/upload', {method: 'POST', body: form});
		const json = await response.json();

		console.log(json)

		if(json.code == 200) {
			 core.info('Artifact ${json} has been successfully uploaded!')
		} else {
			core.setFailed(error.message);
		}

		// Get the JSON webhook payload for the event that triggered the workflow
		const payload = JSON.stringify(github.context.payload, undefined, 2)
		console.log(`The event payload: ${payload}`);
	} catch (error) {
    	core.setFailed(error.message);
	}
}