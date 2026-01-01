export async function load({ url }) {
	// Get selected date from URL or use today
	const dateParam = url.searchParams.get('date');
	let selectedDateString;

	if (dateParam) {
		selectedDateString = dateParam;
	} else {
		const today = new Date();
		selectedDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
	}

	return {
		selectedDate: selectedDateString
	};
}
