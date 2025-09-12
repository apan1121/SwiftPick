export default {
    setCurrentPrizeId(state, prizeId){
        state.currentPrizeId = prizeId;
    },
    setDrawingStatus(state, isDrawing){
        state.isDrawing = !!isDrawing;
    },
    setSpeed(state, speed){
        state.speed = speed;
    },
    incrementLightCount(state){
        state.lightCount += 1;
    },
    resetDrawing(state){
        state.isDrawing = false;
        state.lightCount = 0;
    },
};

