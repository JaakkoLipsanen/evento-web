import React, { Component } from 'react';
import moment from 'moment';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';

import './DateTimePicker.css';

class DateTimePicker extends Component {
	constructor(props) {
		super(props);
		this.state = {
			date: props.initialDate,
			time: props.initialTime,
			disableYearSelection: true
		};
	}

	getDateTime() {
		const date = this.state.date, time = this.state.time;
		if(!date || !time) {
			return null;
		}

		return new Date(
			date.getFullYear(), date.getMonth(), date.getDate(),
			time.getHours(), time.getMinutes(), 0
		);
	}

	render () {
		const styles = {
			style: { height: "62px", flex: "1" },
			inputStyle: { marginTop: "7px", width: "auto" },
			textFieldStyle: { width: "100%", height: "62px" },
			floatingLabelStyle: { top: "28px" },
			errorStyle: { bottom: "12px" },

			disableYearSelection: true,
			floatingLabelFixed: true
		};

		return (
			<div className="DateTimePicker">
				<DatePicker
					className="date-picker"
					floatingLabelText={this.props.dateHintText}
					errorText={this.props.errorText}
					hintText={"Enter " + this.props.dateHintText.toLowerCase()}

					value={this.state.date}
					onChange={(e, date) => this.setState({ date: date }) }
					formatDate={(date) => moment(date).format('DD/MM/YYYY')}
					{...styles}
				/>

				<TimePicker
					className="time-picker"
					floatingLabelText={this.props.timeHintText}
					errorText={this.props.errorText}
					hintText={"Enter " + this.props.timeHintText.toLowerCase()}

					value={this.state.time}
					onChange={(e, time) => this.setState({ time: time }) }
					format="24hr"
					{...styles}
				/>
			</div>
		);
	}
}

export default DateTimePicker;
