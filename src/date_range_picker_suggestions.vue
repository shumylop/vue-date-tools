<template>
    <div class="date-range-picker-suggestions" :class="{'including-label': !!label, 'as-input': !!isInput}" :id="'date-picker-container-' + id">
        <div v-if="!!label" class="label">{{label}}<span v-if="!!required" class="required">*</span></div>
        <div class="input-container" :id="'input-container-' + id">
            <input
                    class="date-picker-input"
                    :class="{focus: hasFocus, icon: !!icon}"
                    @focus="(hasFocus = true) && scrollToDatePicker()"
                    :value="dateRange | DDMMYYYYDDMMYYYY"
                    :placeholder="!!placeholder ? placeholder : ''"
                    :style="inputStyle"
                    :id="'date-picker-input-' + id"
                    @input="event => { event.preventDefault(); event.stopPropagation(); update(event.target.value)}"
            />
            <div v-if="!!icon" class="input-icon-container" :class="{focus: hasFocus}">
                <i :class="'input-icon icon-' + icon + (!!hasFocus ? ' focus' : '')" />
            </div>
            <div v-if="!isInput" class="input-icon-container action" :class="{focus: hasFocus}">
                <i :class="'input-icon icon-chevron-' + (hasFocus ? 'up' : 'down') + (hasFocus ? ' focus' : '')"/>
            </div>
        </div>
        <div v-if="hasFocus" class="date-picker-underlay" @click="hasFocus=false"></div>
        <div
                class="date-range-picker-suggestions-overlay"
                v-if="hasFocus"
                :class="{
                    [position]: true,
                    'including-label': !!label
                }"
                :id="'date-picker-' + id"

        >
            <div class="date-picker-inner">
                <div style="display: flex; justify-content: space-between">
                    <date-input
                            :date="activeRange[0]"
                            :style="{marginTop: '1rem', marginLeft: '0.5rem'}"
                            :max-date="maxDate"
                            @change="date => {
                                viewRange = [date, viewRange[1] > date ? viewRange[1] : (startOfMonth(addMonths(date, 1)) < maxDate ? startOfMonth(addMonths(date, 1)) : startOfMonth(maxDate))];
                                activeRange = [date, dateRange[1] > date ? dateRange[1] : Math.min(addMonths(date, 1), maxDate)];
                            }"
                            class="compact-date-input"
                    />
                    <date-input
                            :date="activeRange[1]"
                            :style="{marginTop: '1rem', marginLeft: '0.5rem'}"
                            @change="date => {
                                viewRange = [viewRange[0] <= date ? viewRange[0] : startOfMonth(addMonths(date, -1)), date];
                                activeRange = [dateRange[0] <= date ? dateRange[0] : addMonths(date, -1), date]
                            }"
                            :max-date="maxDate"
                            class="compact-date-input secondary-compact-date-input"
                    />
                </div>

                <month-selector
                        :view-date="viewRange[0]"
                        @changeView="date=>{ viewRange = [date, viewRange[1] > date ? viewRange[1] : (startOfMonth(addMonths(date, 1)) < maxDate ? startOfMonth(addMonths(date, 1)) : startOfMonth(maxDate))]}"
                        :max-date="addMonths(maxDate, -1)"
                        :first-year="getYear(new Date()) - 5"
                />
                <range-selectable
                        :active-date="activeRange[0]"
                        :active-range="activeRange"
                        :view-date="viewRange[0]"
                        @changeView="date=>{viewRange = [date, viewRange[1] > date ? viewRange[1] : (startOfMonth(addMonths(date, 1)) < maxDate ? startOfMonth(addMonths(date, 1)) : startOfMonth(maxDate))]}"
                        @changeDate="date=>{updateRange(date)}"
                        :max-date="maxDate"
                        @hover="updateHovered"
                        :hovered-date="hoveredDate"
                />
                <validation
                        @apply="$emit('change', activeRange) && (hasFocus = false)"
                        @cancel="hasFocus = false"
                        class="compact-validation"
                />
            </div>
            <div class="date-picker-inner secondary-selector">

                <date-input
                        :date="activeRange[1]"
                        :style="{marginTop: '1rem', marginLeft: '0.5rem'}"
                        :input-style="{width: '22rem'}"
                        @change="date => {
                        viewRange = [viewRange[0] <= date ? viewRange[0] : startOfMonth(addMonths(date, -1)), date];
                        activeRange = [dateRange[0] <= date ? dateRange[0] : addMonths(date, -1), date]
                    }"
                        :max-date="maxDate"
                />

                <month-selector
                        :view-date="viewRange[1]"
                        @changeView="date=>{viewRange = [viewRange[0] <= date ? viewRange[0] : startOfMonth(addMonths(date, -1)), date]}"
                        :max-date="maxDate"
                        :first-year="getYear(new Date()) - 5"
                />
                <range-selectable
                        :active-date="activeRange[1]"
                        :active-range="activeRange"
                        :view-date="viewRange[1]"
                        @changeView="date=>{viewRange = [viewRange[0] <= date ? viewRange[0] : startOfMonth(addMonths(date, -1)), date]}"
                        @changeDate="date=>{updateRange(date)}"
                        :max-date="maxDate"
                        @hover="updateHovered"
                        :hovered-date="hoveredDate"
                />
            </div>
            <div class="date-picker-suggestions">
                <div class="date-picker-suggestion" :class="{active:(label === activeSuggestion)}" v-for="(suggestion, label) in suggestions" @click="() => {
                    viewRange = suggestion
                    activeRange = suggestion
                    activeSuggestion = label
                }" :key="label">
                    {{ ranges[label] }}
                </div>
                <validation
                        @apply="$emit('change', activeRange) && (hasFocus = false)"
                        @cancel="hasFocus = false"
                />
            </div>
        </div>
    </div>
</template>
<script>

import DateInput from './components/date_input'
import RangeSelectable from './components/range_selectable'
import MonthSelector from './components/month_selector'
import Validation from './components/validation'
import startOfMonth from 'date-fns/startOfMonth'
import uuid from './utils/uuid'
import getRangeFromDDMMYYYYDDMMYYYY from './parse/getRangeFromDDMMYYYYDDMMYYYY'
import getMonth from 'date-fns/getMonth'
import getYear from 'date-fns/getYear'
import setMonth from 'date-fns/setMonth'
import setYear from 'date-fns/setYear'
import debounce from 'lodash.debounce'
import addMonths from "date-fns/addMonths";
import addDays from 'date-fns/addDays'
import formatDDMMYYYYDDMMYYYY from "./format/formatDDMMYYYYDDMMYYYY";

export default {
    name: 'date-range-picker-suggestions',
    props: {
        dateRange: {
            type: Array,
            default: null
        },
        maxDate: {
            type: Date,
            default: function() {
                return new Date()
            }
        },
        position: {
            type: String,
            default: "bottom"
        },
        label: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: ''
        },
        inputStyle: {
            type: Object,
            default: function(){
                return {}
            }
        },
        parentId: {
            type: String,
            default: ''
        },

        isInput: {
            type: Boolean,
            default: false
        },
        required: {
            type: Boolean,
            default: false
        },
        icon: {
            type: String,
            default: 'calendar'
        },
        suggestions: {
            type: Object,
            required: true
        }
    },
    data: function () {
        return {
            hasFocus: false,
            viewDate: startOfMonth((this.date) ? this.date : new Date()),
            step: 'selected',
            activeRange: [typeof this.dateRange[0] !== 'undefined' && this.dateRange[0] instanceof Date ? this.dateRange[0] : addMonths(new Date(), -1), (typeof this.dateRange[1] !== 'undefined' && this.dateRange[1] instanceof Date) ? this.dateRange[1] : new Date()],
            id: uuid(),
            fullWidth: 0,
            viewRange: [startOfMonth(typeof this.dateRange[0] !== 'undefined' && this.dateRange[0] instanceof Date ? this.dateRange[0] : addMonths(new Date(), -1)), startOfMonth((typeof this.dateRange[1] !== 'undefined' && this.dateRange[1] instanceof Date) ? this.dateRange[1] : new Date())],
            hoveredDate: null,
            activeSuggestion: 'custom',
            ranges: {
                today: 'Today',
                yesterday: 'Yesterday',
                last7Days: 'Last 7 days',
                last30Days: 'Last 30 days',
                lastMonth: 'Last month',
                custom: 'Custom',
            }
        }
    },
    components: {
        DateInput,
        MonthSelector,
        RangeSelectable,
        Validation
    },

    methods: {
        update: debounce(function(rangeString){
            const range = getRangeFromDDMMYYYYDDMMYYYY(rangeString)
            if(range && range[1] <= this.maxDate){
                this.viewRange = [setMonth(setYear( this.viewRange[0], getYear(range[0])), getMonth(range[0])), setMonth(setYear( this.viewRange[1], getYear(range[0])), getMonth(range[1]))]
                this.activeRange = range
            }
        }, 500),
        scrollToDatePicker: function(){
            //document.getElementById('input-container-' + this.id).style.width = this.fullWidth + 'px'
            if(this.parentId){
                setTimeout(() => {
                    const parentContainer = document.getElementById(this.parentId)
                    const inputContainer = document.getElementById('date-picker-container-' + this.id)
                    const pickerContainer = document.getElementById('date-picker-' + this.id)
                    const invisible = (inputContainer.offsetTop + inputContainer.offsetHeight + pickerContainer.offsetHeight) - (parentContainer.scrollTop + parentContainer.offsetHeight)
                    if(invisible > 0){
                        parentContainer.scrollTop = parentContainer.scrollTop + invisible
                    }
                })
            }
        },
        updateRange: function(date){
            this.hoveredDate = null

            if(date && date instanceof Date){
                if(date > this.maxDate){
                    date = this.maxDate
                }
                let startDate = this.activeRange[0]
                let endDate = this.activeRange[1]
                let startDefined = (!!startDate && startDate instanceof Date)
                let endDefined = (!!endDate && endDate instanceof Date)
                this.activeSuggestion = 'custom'
                if(startDefined && endDefined){

                    this.activeRange = [date, null]
                } else if(startDefined && !endDefined){

                    if(startDate === date){
                        startDate = addDays(date, -1)
                    }
                    if(startDate < date){
                        this.activeRange = [startDate, date]
                    } else {
                        this.activeRange = [date, startDate]
                    }
                }
            }
        },
        updateHovered: function(date){
            if(!!date && date instanceof Date && date <= this.maxDate){
                let startDate = this.activeRange[0]
                let endDate = this.activeRange[1]
                let startDefined = (!!startDate && startDate instanceof Date)
                let endDefined = (!!endDate && endDate instanceof Date)
                if(startDefined && !endDefined){
                    this.hoveredDate = date
                }
            }
        },
        startOfMonth,
        addMonths,
        getYear
    },

    created: function(){
        if(this.date){
            this.activeDate = this.date
        }
    },
    mounted: function(){
        this.fullWidth = document.getElementById('input-container-' + this.id).offsetWidth
    },

    filters: {
        'DDMMYYYYDDMMYYYY': formatDDMMYYYYDDMMYYYY
    },

}
</script>
<style scoped>
    .date-range-picker-suggestions {
        position: relative;
        display: block;
        height: 4rem;

        margin: 0;
        padding: 0;
    }
    .including-label {
        height: 6rem;
    }

    .input-container {
        position: relative;
        height: 4rem;
        width: 24rem;
        margin: 0;
        padding: 0;
        display: block;
    }

    .date-picker-input {
        padding-top: 0rem;
        background-color: #fff;
        text-align: left;
        padding-left: 2rem;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        color: #35495d;

        height: 4rem;
        line-height: 1.6rem;
        border-radius: 2rem;
        border: 2px solid #35495d;
        font-size: 1.8rem;
        width: 24rem;
        cursor: pointer;
        outline:none;

    }

    .date-picker-input.icon {
        padding-left: 4rem;
    }

    .date-picker-input:focus {
        border-color: #35495d;
        background-color: #35495d;
        color: #fff;
        outline: none;
        box-shadow: none;
        position: absolute;
        z-index: 12351;
        top: 0;
        left: 0;
    }

    .date-picker-underlay {
        position: fixed;
        z-index: 12350;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100vh;
        width: 100vw;
        background-color: #aaa;
        opacity: 0.15;
    }

    .date-range-picker-suggestions-overlay  {
        position: absolute;
        z-index: 12400;
        display: flex;
        background-color: #fff;
        border-radius: 0.4rem;
        padding: 0.4rem;
        flex-direction: row;
        border: 1px solid rgba(0, 0, 0, 0.15);
        justify-content: space-around;
        height: 28rem;
        width: 28rem;
    }

    .date-picker-inner {
        display: flex;
        flex-direction: column;
    }

    .input-icon-container{
        position: absolute;
        left: 0.4rem;
        padding: 0;
        margin: 0;
        top: 0;
        height: 4rem;
        width: 4rem;
        display: flex;
        justify-content: center;
        pointer-events: none;

    }
    .input-icon-container.focus {
        z-index: 12352;
    }
    .input-icon-container.action{
        left: unset;
        right: 0.4rem;
    }
    .input-icon {
        align-self: center;
        padding: 0;
        margin: 0;
        color: #35495d;
    }
    .input-container:hover .date-picker-input,.input-container:hover .input-icon,.input-icon.focus,.date-picker-input.focus{
        color: #fff;
        background-color: #35495d;
    }

    .top {

    }
    .bottom {

    }
    .bottom-left {
        top: 4rem;
        right: 0;
    }
    .center {
        left: -24rem;
    }
    .left {
        right: 0;
    }
    .right {

    }

    .label {
        color: #999;
        font-size: 1.4rem;
        padding-left: 15px;
        height: 20px;
    }

    .required {
        color: #d9534f;
        margin-left: 4px;
    }

    .date-range-picker-suggestions.as-input .date-picker-input{
        font-size: 1.6rem;
        border-radius: 0.8rem;
        padding-top: 0.8rem;
        padding-right: 1.2rem;
        padding-bottom: 0.8rem;
        padding-left: 1.2rem;
        color: #303038;
        border: 1px solid #ced4da;
        background-color: #fff;
    }

    .date-range-picker-suggestions.as-input, .date-range-picker-suggestions.as-input .input-container, .date-range-picker-suggestions.as-input .date-picker-input {
        width: 21rem;
    }

    .date-range-picker-suggestions.as-input .input-container:hover .date-picker-input, .date-range-picker-suggestions.as-input .input-container:hover .input-icon, .date-range-picker-suggestions.as-input .input-icon.focus, .date-range-picker-suggestions.as-input .date-picker-input.focus{
        color: #303038;
        background-color: #fff;
        border: 1px solid #51bdba;
    }

    .date-picker-suggestions {
        width: 16rem;
        list-style: none;
        margin: 0;
        padding: 0;
        display: none;
        flex-direction: column;
        justify-content: center;
    }
    .date-picker-suggestion {
        font-size: 1.3rem;
        background-color: #f5f5f5;
        border: 1px solid #f5f5f5;
        border-radius: 0.4rem;
        color: #40b883;
        padding: 0.3rem 1.2rem;
        margin-bottom: 0.8rem;
        cursor: pointer;

    }
    .date-picker-suggestion.active {
        background-color: #40b883;
        border: 1px solid #40b883;
        color: #fff;
    }

    .secondary-selector {
        display: none;
    }

    .compact-date-input {
        width: 8rem;
    }

    .compact-date-input input.date-input {
        padding-left: 0;
    }

    .secondary-compact-date-input{
        margin-right: 3.5rem;
    }

    @media (min-width: 768px) {
        .secondary-selector, .date-picker-suggestions {
            display: flex;
        }
        .date-range-picker-suggestions-overlay {
            width: 76rem;
            height: 26rem;
            justify-content: space-around;
        }
        .compact-date-input {
            width: 22rem;
        }
        .secondary-compact-date-input, .compact-validation{
            display: none;
        }
    }

</style>
