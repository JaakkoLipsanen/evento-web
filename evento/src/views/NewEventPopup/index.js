import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import Toggle from 'material-ui/Toggle';

import DateTimePicker from './components/DateTimePicker';

import moment from 'moment';
import api from '../../api';
import './NewEventPopup.css';

class NewEventPopup extends Component {
	constructor(props) {
		super(props);
		this.state = {
			categories: [],
			fieldErrors: {}
			// other fields specified in reset()
		}
	}

	reset() {
		// this doesn't atm reset start date/time or end time, since they are saved
		// to the state-ly component DateTimePicker. TODO: fix it?
		this.setState({
			title: '',
			description: '',
			category: null,
			location: '',

			errorMessage: null, // singular error, like "Server not responding"
			fieldErrors: { }, // field specific error, like "category not found"
			open: false,
		});

		this.forceUpdate();
	}

	show() {
		this.reset();
		this.setState({ open: true });
	}

	close() {
		this.setState({ open: false })
	}

	componentDidMount() {
		this.reset();
		this.fetchCategories();
	}

	async fetchCategories() {
		const result = await api.getCategories();
		if(result.success) {
			this.setState({ categories: result.payload.categories });
		}
		else {
			this.setState({ errorMessage: result.error.message });
		}
	}

	async createEvent() {
		const category = this.state.categories.find(c => c.name === this.state.category);
		if (!category) {
			this.setState({ fieldErrors: { category: 'not found' } });
			return;
		}

		const startTime = this.startTimePicker.getDateTime();
		if(!startTime) {
			this.setState({ fieldErrors: { time: 'must be set' } });
			return;
		}

		const result = await api.createNewEvent({
			title: this.state.title,
			description: this.state.description,
			categoryId: category.id,
			startTime: moment(startTime).format(),
			location: this.state.location
		});

		if(result.success) {
			// TODO: should redirect to the page of the newly created event?
			// If creation was successful, redirect to MyEvents
			// this.props.history.push('/events');
			if(this.props.onCreated) {
				this.props.onCreated(result.payload.event);
			}

			this.close();
		}
		else {
			this.setErrors(result.error);
		}
	}

	setErrors(error) {
		// singular error, if the problem is "Server not responding" for example
		this.setState({ errorMessage: error.message });

		// errors with the submitted fields
		if(error.messages && error.messages.raw) {
			const raw = error.messages.raw;
			const getErr = (field) => field ? field[0] : undefined;

			this.setState({
				fieldErrors: {
					title: getErr(raw.title),
					description: getErr(raw.description),
					category: getErr(raw.category),
					time: getErr(raw.time),
				}
			});
		}
	}

	onStartTimeChange(time) {
		// if start time is changed and end time is specified,
		// then default end time to start time + 1hr
		if(!this.endTimePicker.getTime()) {
			const newTime = new Date(time);
			newTime.setHours(time.getHours() + 1);
			this.endTimePicker.setTime(newTime);
		}
	}

	render () {
		const fieldStyles = {
			style: { height: "62px" },
			inputStyle: { marginTop: "9px" },
			textareaStyle: { marginTop: "20px", marginBottom: "-20px" },
			floatingLabelStyle: { top: "28px" },
			errorStyle: { bottom: "10px" },

			fullWidth: true,
			floatingLabelFixed: true
		};

		const parentDivStyle = {
			visibility: this.state.open ? "visible" : "hidden",
			opacity: this.state.open ? 1 : 0
		 };

		// fade the position to the center from above
		const popupDivStyle = { marginTop: this.state.open ? "50vh" : "35vh" };

		return (
			<div className="NewEventPopup" style={parentDivStyle}>
				<Paper
					className="popup-container"
					zDepth={5}
					style={popupDivStyle}
				>
					<p className="error-message">{ this.state.errorMessage }</p>
					<TextField
						floatingLabelText="Event name"
						hintText="Name should be short and clear"
						errorText={this.state.fieldErrors.title}

						value={this.state.title}
						onChange={(evt) => this.setState({ title: evt.target.value })}
						{...fieldStyles} />

					<TextField
						floatingLabelText="Location"
						hintText="Address or place"
						errorText={this.state.fieldErrors.location}

						value={this.state.location}
						onChange={(evt) => this.setState({ location: evt.target.value })}
						{...fieldStyles} />

					<TextField
						floatingLabelText="Description"
						hintText="Tell more about this event"
						errorText={this.state.fieldErrors.description}

						value={this.state.description}
						multiLine={true}
						rows={1}

						onChange={(evt) => this.setState({ description: evt.target.value })}
						{...fieldStyles} />


					<SelectField
						floatingLabelText="Category"
						hintText="Select category"
						errorText={this.state.fieldErrors.category}

						value={this.state.category}
						onChange={(e, i, val) => this.setState({ category: val })}
						{...fieldStyles}
					>
						{ this.state.categories.map(category =>
							<MenuItem key={category.id} value={category.name} primaryText={category.name} />
						)}
					</SelectField>

					<DateTimePicker
						ref={picker => this.startTimePicker = picker}
						onTimeChange={(time) => this.onStartTimeChange(time)}

						dateHintText="Start date"
						timeHintText="Start time"
						errorText={this.state.fieldErrors.time}
					/>

					<DateTimePicker
						ref={picker => this.endTimePicker = picker}

						timeOnly={true}
						timeHintText="End time"
					/>

					<Toggle
						toggled={this.state.isWeekly}
						disabled={true}
						onToggle={(e, val) => this.setState({ isWeekly: val })}
						label="Repeat weekly"
						style={{ marginLeft: "50%", width: "calc(50% - 6px)", paddingLeft: "6px" }} />

					<div style={{ display: "flex", marginBottom: "24px" }}>
						<RaisedButton
							label="Create Event"
							primary={true}
							style={{ marginTop: "16px", marginRight: "4px", width: "50%" }}
							onClick={() => this.createEvent()} />

						<RaisedButton
							label="Cancel"
							style={{ marginTop: "16px", marginLeft: "4px", width: "50%" }}
							onClick={() => this.close()} />
					</div>
				</Paper>
			</div>
		);
	}
}

export default NewEventPopup;
