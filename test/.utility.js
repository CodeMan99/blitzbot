function autoEndTest(testCase) {
	return async function executeTest(st) {
		try {
			await testCase(st);
		} catch (error) {
			st.fail(error);
		} finally {
			st.end();
		}
	};
}

module.exports = {
    autoEndTest: autoEndTest
};
