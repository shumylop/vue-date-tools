<template>
    <div class="time-selector">
        <i v-if="clockIconClass" class="clock" :class="clockIconClass"/>
        <base-select
                title="Hour"
                :options="Array(24).fill().map( (_, hour) => parseInt(hour))"
                :value="getHours(activeDate)"
                @change="$emit('changeTime', setHours(activeDate, $event))"
                :optionDisabled="option=> (setHours(activeDate, option) > maxDate)"
        />
        <div>&nbsp;:&nbsp;</div>
        <base-select
                title="Minutes"
                :options="Array(60).fill().map( (_, minutes) => parseInt(minutes))"
                :value="getMinutes(activeDate) < 10 ? ('0' + getMinutes(activeDate)) : getMinutes(activeDate)"
                @change="$emit('changeTime', setMinutes(activeDate, $event))"
                :class="'timeselect'"
                :optionDisabled="option=> (setMinutes(activeDate, option) > maxDate)"
        >
            <template slot="option" slot-scope="props">
                <div
                        @click="() => props.update(props.option, props.id)"
                        :class="{
                        'timeoption': true,
                        'count': !!props.index,
                        'disabled': props.disabled
                    }"
                        :id="props.id"
                >&nbsp;
                </div>
            </template>
        </base-select>
        <div>&nbsp;:&nbsp;</div>
        <base-select
                title="Seconds"
                :options="Array(60).fill().map( (_, seconds) => parseInt(seconds))"
                :value="getSeconds(activeDate) < 10 ? ('0' + getSeconds(activeDate)) : getSeconds(activeDate)"
                @change="$emit('changeTime', setSeconds(activeDate, $event))"
                :class="'timeselect'"
                :optionDisabled="option=> (setSeconds(activeDate, option) > maxDate)"
        >
            <template slot="option" slot-scope="props">
                <div
                        @click="() => props.update(props.option, props.id)"
                        :class="{
                        'timeoption': true,
                        'count': !!props.index,
                        'disabled': props.disabled
                    }"
                        :id="props.id"
                >&nbsp;
                </div>
            </template>
        </base-select>
    </div>
</template>
<script>
    import setHours from 'date-fns/setHours'
    import setMinutes from 'date-fns/setMinutes'
    import setSeconds from 'date-fns/setSeconds'
    import getHours from 'date-fns/getHours'
    import getMinutes from 'date-fns/getMinutes'
    import getSeconds from 'date-fns/getSeconds'
    import BaseSelect from './base_select'

    export default {
        name: 'time-selector',
        props: {
            activeDate: {
                type: Date
            },
            clockIconClass: {
                type: String,
                default: 'icon-clock'
            },
            maxDate: {
                type: Date,
                default: function(){
                    return new Date()
                }
            }
        },
        components: {
            BaseSelect
        },
        methods: {
            setHours,
            setMinutes,
            setSeconds,
            getHours,
            getMinutes,
            getSeconds
        },
    }
</script>
<style scoped>
    .time-selector {
        display: flex;
        padding: 1rem;
        width: 26rem;
        height: 3.5rem;
        justify-content: space-between;
    }

    .timeselect {
        counter-reset: option;
    }

    .timeoption {
        background-color: #fff;
        color: #000;
        width: 5rem;
        height: 2rem;
        padding-left: 0.5rem;
        padding-top: 0.2rem;
    }

    .timeoption:hover {
        background-color: #40b883;
        color: #fff;
    }

    .timeoption:before {
        content: counter(option, decimal-leading-zero);
        margin-right: 0.25rem;
    }
    .timeoption.disabled, .timeoption.disabled:hover{
        color: #fff;
        background-color: #ccc;
    }

    .count:before {
        counter-increment: option;
    }

    .clock {
        margin-top: 0.3rem;
    }

</style>

