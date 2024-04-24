package com.locationtracking;
import android.os.PowerManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class BatteryOptimizationModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public BatteryOptimizationModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "BatteryOptimization";
    }

    @ReactMethod
    public void isBatteryOptimizationEnabled(Promise promise) {
        PowerManager powerManager = (PowerManager) reactContext.getSystemService(ReactApplicationContext.POWER_SERVICE);
        boolean isIgnoringBatteryOptimizations = false;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            isIgnoringBatteryOptimizations = powerManager.isIgnoringBatteryOptimizations(reactContext.getPackageName());
        }
        promise.resolve(isIgnoringBatteryOptimizations);
    }
}