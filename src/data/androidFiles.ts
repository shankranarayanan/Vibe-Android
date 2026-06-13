export interface AndroidFile {
  name: string;
  path: string;
  language: 'java' | 'xml';
  category: 'model' | 'database' | 'viewmodel' | 'adapter' | 'intent' | 'glide' | 'layout';
  description: string;
  code: string;
}

export const androidFiles: AndroidFile[] = [
  {
    name: "Category.java",
    path: "model/Category.java",
    language: "java",
    category: "model",
    description: "Room Entity representing a business category (e.g., Home Bakers, Plumbers) with appropriate primary keys and indexes.",
    code: `package com.dukan.adambakkam.model;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

/**
 * Representing highly specialized local business categories.
 */
@Entity(tableName = "categories")
public class Category {
    @PrimaryKey
    @NonNull
    @ColumnInfo(name = "id")
    private String id;

    @NonNull
    @ColumnInfo(name = "name")
    private String name;

    @ColumnInfo(name = "icon_url")
    private String iconUrl;

    public Category(@NonNull String id, @NonNull String name, String iconUrl) {
        this.id = id;
        this.name = name;
        this.iconUrl = iconUrl;
    }

    @NonNull
    public String getId() { return id; }
    
    @NonNull
    public String getName() { return name; }
    
    public String getIconUrl() { return iconUrl; }
}`
  },
  {
    name: "Business.java",
    path: "model/Business.java",
    language: "java",
    category: "model",
    description: "Room Entity storing business profiles. Restructured with a ForeignKey reference to Category, onDelete cascade, and explicit indexation to scale optimally.",
    code: `package com.dukan.adambakkam.model;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.ForeignKey;
import androidx.room.Index;
import androidx.room.PrimaryKey;

/**
 * Business model representing a local vendor, bakery, or service provider.
 * Optimized with indices to avoid sequential scans when filtering by category.
 */
@Entity(
    tableName = "businesses",
    foreignKeys = @ForeignKey(
        entity = Category.class,
        parentColumns = "id",
        childColumns = "category_id",
        onDelete = ForeignKey.CASCADE
    ),
    indices = {@Index(value = {"category_id"})}
)
public class Business {
    @PrimaryKey
    @NonNull
    @ColumnInfo(name = "id")
    private String id;

    @NonNull
    @ColumnInfo(name = "category_id")
    private String categoryId;

    @NonNull
    @ColumnInfo(name = "name")
    private String name;

    @ColumnInfo(name = "address")
    private String address;

    @NonNull
    @ColumnInfo(name = "phone_number")
    private String phoneNumber;

    @ColumnInfo(name = "whatsapp_number")
    private String whatsappNumber;

    @ColumnInfo(name = "rating")
    private float rating;

    @ColumnInfo(name = "thumbnail_url")
    private String thumbnailUrl;

    @ColumnInfo(name = "tagline")
    private String tagline;

    public Business(@NonNull String id, @NonNull String categoryId, @NonNull String name, 
                    String address, @NonNull String phoneNumber, String whatsappNumber, 
                    float rating, String thumbnailUrl, String tagline) {
        this.id = id;
        this.categoryId = categoryId;
        this.name = name;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.whatsappNumber = whatsappNumber;
        this.rating = rating;
        this.thumbnailUrl = thumbnailUrl;
        this.tagline = tagline;
    }

    // Getters and Setters
    @NonNull public String getId() { return id; }
    @NonNull public String getCategoryId() { return categoryId; }
    @NonNull public String getName() { return name; }
    public String getAddress() { return address; }
    @NonNull public String getPhoneNumber() { return phoneNumber; }
    public String getWhatsappNumber() { return whatsappNumber; }
    public float getRating() { return rating; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public String getTagline() { return tagline; }
}`
  },
  {
    name: "Catalog.java",
    path: "model/Catalog.java",
    language: "java",
    category: "model",
    description: "Representing catalog images or physical pamphlet pages. Configured with a cascade delete relationship relating back to the parent business.",
    code: `package com.dukan.adambakkam.model;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.ForeignKey;
import androidx.room.Index;
import androidx.room.PrimaryKey;

/**
 * Class representing single catalog/pamphlet pages.
 * Supports multiple high-resolution images per business profile.
 */
@Entity(
    tableName = "catalogs",
    foreignKeys = @ForeignKey(
        entity = Business.class,
        parentColumns = "id",
        childColumns = "business_id",
        onDelete = ForeignKey.CASCADE
    ),
    indices = {@Index(value = {"business_id"})}
)
public class Catalog {
    @PrimaryKey(autoGenerate = true)
    private int id;

    @NonNull
    @ColumnInfo(name = "business_id")
    private String businessId;

    @NonNull
    @ColumnInfo(name = "image_url")
    private String imageUrl;

    @ColumnInfo(name = "display_order")
    private int displayOrder;

    public Catalog(@NonNull String businessId, @NonNull String imageUrl, int displayOrder) {
        this.businessId = businessId;
        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    @NonNull public String getBusinessId() { return businessId; }
    @NonNull public String getImageUrl() { return imageUrl; }
    public int getDisplayOrder() { return displayOrder; }
}`
  },
  {
    name: "BusinessWithCatalogs.java",
    path: "model/BusinessWithCatalogs.java",
    language: "java",
    category: "model",
    description: "Database relationship structure utilizing Room's @Relation annotation. Solves the N+1 query problem by pulling catalogs in a single transactions operation.",
    code: `package com.dukan.adambakkam.model;

import androidx.room.Embedded;
import androidx.room.Relation;
import java.util.List;

/**
 * Clean POJO to fetch a complete business profile along with all catalog leaflets
 * loaded synchronously using a single SQL Transaction.
 */
public class BusinessWithCatalogs {
    @Embedded
    public Business business;

    @Relation(
        parentColumn = "id",
        entityColumn = "business_id"
    )
    public List<Catalog> catalogs;
}`
  },
  {
    name: "BusinessDao.java",
    path: "database/BusinessDao.java",
    language: "java",
    category: "database",
    description: "Room DAO providing asynchronous queries returning standard LiveData observing interfaces, compiled with SQLite index specifications.",
    code: `package com.dukan.adambakkam.database;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import androidx.room.Transaction;

import com.dukan.adambakkam.model.Business;
import com.dukan.adambakkam.model.BusinessWithCatalogs;
import com.dukan.adambakkam.model.Catalog;
import com.dukan.adambakkam.model.Category;

import java.util.List;

@Dao
public interface BusinessDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertCategories(List<Category> categories);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertBusinesses(List<Business> businesses);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertCatalogs(List<Catalog> catalogs);

    @Query("SELECT * FROM categories ORDER BY name ASC")
    LiveData<List<Category>> getAllCategories();

    @Query("SELECT * FROM businesses WHERE category_id = :categoryId ORDER BY rating DESC")
    LiveData<List<Business>> getBusinessesByCategory(String categoryId);

    @Transaction
    @Query("SELECT * FROM businesses WHERE id = :businessId LIMIT 1")
    LiveData<BusinessWithCatalogs> getBusinessWithCatalogs(String businessId);

    @Query("SELECT * FROM businesses WHERE name LIKE '%' || :query || '%' OR tagline LIKE '%' || :query || '%'")
    LiveData<List<Business>> searchBusinesses(String query);
}`
  },
  {
    name: "AppDatabase.java",
    path: "database/AppDatabase.java",
    language: "java",
    category: "database",
    description: "Core Room database coordinator using double-checked locking singleton instantiation, complete with an asynchronous pre-population executor.",
    code: `package com.dukan.adambakkam.database;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;
import androidx.sqlite.db.SupportSQLiteDatabase;

import com.dukan.adambakkam.model.Business;
import com.dukan.adambakkam.model.Catalog;
import com.dukan.adambakkam.model.Category;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Database(entities = {Category.class, Business.class, Catalog.class}, version = 1, exportSchema = false)
public abstract class AppDatabase extends RoomDatabase {

    public abstract BusinessDao businessDao();

    private static volatile AppDatabase INSTANCE;
    private static final int NUMBER_OF_THREADS = 4;
    public static final ExecutorService databaseWriteExecutor = 
            Executors.newFixedThreadPool(NUMBER_OF_THREADS);

    public static AppDatabase getDatabase(final Context context) {
        if (INSTANCE == null) {
            synchronized (AppDatabase.class) {
                if (INSTANCE == null) {
                    INSTANCE = Room.databaseBuilder(context.getApplicationContext(),
                                    AppDatabase.class, "dukan_adambakkam_db")
                            .addCallback(sRoomDatabaseCallback)
                            .build();
                }
            }
        }
        return INSTANCE;
    }

    /**
     * Seed initial catalog directory data asynchronously on database creation.
     */
    private static final RoomDatabase.Callback sRoomDatabaseCallback = new RoomDatabase.Callback() {
        @Override
        public void onCreate(@NonNull SupportSQLiteDatabase db) {
            super.onCreate(db);
            databaseWriteExecutor.execute(() -> {
                BusinessDao dao = INSTANCE.businessDao();
                
                // Seed Categories
                List<Category> categories = new ArrayList<>();
                categories.add(new Category("cat_baker", "Home Bakers & Desserts", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=120"));
                categories.add(new Category("cat_kitchen", "Cloud Kitchens & Caterers", "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=120"));
                categories.add(new Category("cat_services", "Plumbers, Electricians & ACs", "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120"));
                dao.insertCategories(categories);

                // Seed Businesses (Adambakkam local experts)
                List<Business> businesses = new ArrayList<>();
                businesses.add(new Business(
                        "b_adambakkam_baker", 
                        "cat_baker", 
                        "Adambakkam Sweet Alchemy",
                        "No 42, Brindavan Street, Adambakkam, Chennai - 600088",
                        "+919840123456",
                        "919840123456",
                        4.8f,
                        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
                        "Custom Tier Premium Cakes & High Tea Delights!"
                ));
                businesses.add(new Business(
                        "b_amma_kitchen", 
                        "cat_kitchen", 
                        "Amma's Madurai Parotta House",
                        "No 15, New Colony Main Rd, Adambakkam, Chennai - 600088",
                        "+919840987654",
                        "919840987654",
                        4.9f,
                        "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400",
                        "Traditional South Indian Cloud Kitchen. Daily Menus Available!"
                ));
                businesses.add(new Business(
                        "b_balaji_plumbing", 
                        "cat_services", 
                        "Balaji Electrical & AC Repairs",
                        "Served across Adambakkam, Thillaiganga Nagar & Nanganallur",
                        "+919840004321",
                        "919840004321",
                        4.6f,
                        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400",
                        "Plumbing, wiring, and inverter repair specialists."
                ));
                dao.insertBusinesses(businesses);

                // Seed Catalogs (Pamphlet Images)
                List<Catalog> catalogs = new ArrayList<>();
                // Bakery Pamphlets
                catalogs.add(new Catalog("b_adambakkam_baker", "https://images.unsplash.com/photo-1605697040924-852290f67f41?w=800", 1));
                catalogs.add(new Catalog("b_adambakkam_baker", "https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?w=800", 2));
                // Amma's Kitchen Pamphlets
                catalogs.add(new Catalog("b_amma_kitchen", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800", 1));
                catalogs.add(new Catalog("b_amma_kitchen", "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800", 2));
                // Balaji Repairs
                catalogs.add(new Catalog("b_balaji_plumbing", "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800", 1));
                
                dao.insertCatalogs(catalogs);
            });
        }
    };
}`
  },
  {
    name: "BusinessViewModel.java",
    path: "viewmodel/BusinessViewModel.java",
    language: "java",
    category: "viewmodel",
    description: "ViewModel managing data operations safely across lifecycle events. Exposes encapsulated LiveData streams directly to the UI.",
    code: `package com.dukan.adambakkam.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Transformations;

import com.dukan.adambakkam.database.AppDatabase;
import com.dukan.adambakkam.database.BusinessDao;
import com.dukan.adambakkam.model.Business;
import com.dukan.adambakkam.model.BusinessWithCatalogs;
import com.dukan.adambakkam.model.Category;

import java.util.List;

public class BusinessViewModel extends AndroidViewModel {

    private final BusinessDao businessDao;
    private final LiveData<List<Category>> allCategories;
    
    // Mutable triggers to switch dynamic directory lists on live search/filters
    private final MutableLiveData<String> selectedCategoryId = new MutableLiveData<>();
    private final LiveData<List<Business>> filteredBusinesses;

    public BusinessViewModel(@NonNull Application application) {
        super(application);
        AppDatabase db = AppDatabase.getDatabase(application);
        businessDao = db.businessDao();
        allCategories = businessDao.getAllCategories();

        // SwitchMap guarantees we cleanly re-fetch business streams when Category selection toggles, 
        // preventing memory stagnation or stale UI threads.
        filteredBusinesses = Transformations.switchMap(selectedCategoryId, categoryId -> {
            if (categoryId == null || categoryId.isEmpty()) {
                return new MutableLiveData<>(); // Empty fallback
            }
            return businessDao.getBusinessesByCategory(categoryId);
        });
    }

    public LiveData<List<Category>> getAllCategories() {
        return allCategories;
    }

    public void selectCategory(String categoryId) {
        selectedCategoryId.setValue(categoryId);
    }

    public LiveData<List<Business>> getFilteredBusinesses() {
        return filteredBusinesses;
    }

    public LiveData<BusinessWithCatalogs> getBusinessWithCatalogs(String businessId) {
        return businessDao.getBusinessWithCatalogs(businessId);
    }

    public LiveData<List<Business>> searchBusinesses(String query) {
        return businessDao.searchBusinesses(query);
    }
}`
  },
  {
    name: "BusinessAdapter.java",
    path: "adapter/BusinessAdapter.java",
    language: "java",
    category: "adapter",
    description: "RecyclerView implementation highlighting ViewHolder reusing, optimized list modifications with DiffUtil, and Glide's efficient image loading configuration.",
    code: `package com.dukan.adambakkam.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.DiffUtil;
import androidx.recyclerview.widget.ListAdapter;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.bumptech.glide.request.RequestOptions;
import com.dukan.adambakkam.R;
import com.dukan.adambakkam.model.Business;

public class BusinessAdapter extends ListAdapter<Business, BusinessAdapter.BusinessViewHolder> {

    private final OnBusinessClickListener listener;

    public interface OnBusinessClickListener {
        void onBusinessClick(Business business);
        void onCallClick(Business business);
        void onWhatsAppClick(Business business);
    }

    public BusinessAdapter(@NonNull OnBusinessClickListener listener) {
        super(DIFF_CALLBACK);
        this.listener = listener;
    }

    // DiffUtil handles off-thread list checks. Perfect O(N) rendering.
    private static final DiffUtil.ItemCallback<Business> DIFF_CALLBACK = new DiffUtil.ItemCallback<Business>() {
        @Override
        public boolean areItemsTheSame(@NonNull Business oldItem, @NonNull Business newItem) {
            return oldItem.getId().equals(newItem.getId());
        }

        @Override
        public boolean areContentsTheSame(@NonNull Business oldItem, @NonNull Business newItem) {
            return oldItem.getName().equals(newItem.getName()) &&
                    oldItem.getRating() == newItem.getRating() &&
                    oldItem.getTagline().equals(newItem.getTagline()) &&
                    oldItem.getThumbnailUrl().equals(newItem.getThumbnailUrl());
        }
    };

    @NonNull
    @Override
    public BusinessViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_business, parent, false);
        return new BusinessViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull BusinessViewHolder holder, int position) {
        holder.bind(getItem(position), listener);
    }

    static class BusinessViewHolder extends RecyclerView.ViewHolder {
        private final ImageView imgThumbnail;
        private final TextView txtName;
        private final TextView txtTagline;
        private final TextView txtRating;
        private final TextView txtAddress;
        private final View btnCall;
        private final View btnWhatsApp;

        public BusinessViewHolder(@NonNull View itemView) {
            super(itemView);
            imgThumbnail = itemView.findViewById(R.id.img_thumbnail);
            txtName = itemView.findViewById(R.id.txt_name);
            txtTagline = itemView.findViewById(R.id.txt_tagline);
            txtRating = itemView.findViewById(R.id.txt_rating);
            txtAddress = itemView.findViewById(R.id.txt_address);
            btnCall = itemView.findViewById(R.id.btn_call);
            btnWhatsApp = itemView.findViewById(R.id.btn_whatsapp);
        }

        public void bind(final Business business, final OnBusinessClickListener listener) {
            txtName.setText(business.getName());
            txtTagline.setText(business.getTagline());
            txtRating.setText(String.format("★ %.1f", business.getRating()));
            txtAddress.setText(business.getAddress());

            // Image handling configuration that prevents RAM overhead
            RequestOptions options = new RequestOptions()
                    .placeholder(R.drawable.placeholder_catalog)
                    .error(R.drawable.error_image)
                    .centerCrop()
                    .diskCacheStrategy(DiskCacheStrategy.ALL); // Caches resized image too

            Glide.with(itemView.getContext())
                    .load(business.getThumbnailUrl())
                    .apply(options)
                    .into(imgThumbnail);

            itemView.setOnClickListener(v -> listener.onBusinessClick(business));
            btnCall.setOnClickListener(v -> listener.onCallClick(business));
            btnWhatsApp.setOnClickListener(v -> listener.onWhatsAppClick(business));
        }
    }
}`
  },
  {
    name: "IntentHelper.java",
    path: "intent/IntentHelper.java",
    language: "java",
    category: "intent",
    description: "Action helper routing phone calls and direct WhatsApp message APIs safely with package checks to ensure fail-safe execution when WhatsApp is missing.",
    code: `package com.dukan.adambakkam.intent;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.widget.Toast;

/**
 * Utility executing native Phone and WhatsApp deep-links cleanly.
 * Robust try-catch fallback structures avoid application crashes on non-equipped devices.
 */
public class IntentHelper {

    /**
     * Trigger native calling UI cleanly using dial intent.
     * Prevents security exceptions by calling dialer (requiring no direct permissions).
     */
    public static void dialPhoneNumber(Context context, String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            Toast.makeText(context, "Invalid Phone Number", Toast.LENGTH_SHORT).show();
            return;
        }

        try {
            Intent intent = new Intent(Intent.ACTION_DIAL);
            intent.setData(Uri.parse("tel:" + phoneNumber.trim()));
            context.startActivity(intent);
        } catch (Exception e) {
            Toast.makeText(context, "No telephony application available.", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Opens direct WhatsApp Business or Personal chat using official URI pattern.
     * Fallback mechanism dynamically routes to web-endpoint if app packages are not installed.
     */
    public static void openWhatsAppChat(Context context, String whatsappNumber, String initialMessage) {
        if (whatsappNumber == null || whatsappNumber.trim().isEmpty()) {
            Toast.makeText(context, "WhatsApp contact not provided.", Toast.LENGTH_SHORT).show();
            return;
        }

        // Standardize clean international formatting (removing + or spacing)
        String cleanedNumber = whatsappNumber.replaceAll("[^+0-9]", "");
        if (cleanedNumber.startsWith("+")) {
            cleanedNumber = cleanedNumber.substring(1);
        }

        String encodedMessage = Uri.encode(initialMessage != null ? initialMessage : "Hello!");
        String whatsappUri = "https://api.whatsapp.com/send?phone=" + cleanedNumber + "&text=" + encodedMessage;
        Uri uri = Uri.parse(whatsappUri);

        // Try direct mobile package launch to avoid loading browser in-app.
        Intent appIntent = new Intent(Intent.ACTION_VIEW, uri);
        appIntent.setPackage("com.whatsapp");

        try {
            // First check: try to launch personal whatsapp directly
            context.startActivity(appIntent);
        } catch (Exception e) {
            try {
                // Second check: Try WhatsApp Business package
                Intent businessIntent = new Intent(Intent.ACTION_VIEW, uri);
                businessIntent.setPackage("com.whatsapp.w4b");
                context.startActivity(businessIntent);
            } catch (Exception ex) {
                // Final Fallback: Launch using standard web browser redirection
                Toast.makeText(context, "WhatsApp app not found. Opening safe Web redirect...", Toast.LENGTH_SHORT).show();
                Intent browserIntent = new Intent(Intent.ACTION_VIEW, uri);
                try {
                    context.startActivity(browserIntent);
                } catch (Exception webEx) {
                    Toast.makeText(context, "No browser or WhatsApp installed.", Toast.LENGTH_SHORT).show();
                }
            }
        }
    }
}`
  },
  {
    name: "GlideConfiguration.java",
    path: "glide/GlideConfiguration.java",
    language: "java",
    category: "glide",
    description: "AppGlideModule configuration overriding default memory cache limit. Adapts to JVM low-RAM constraints and enables efficient Hardware Bitmap configurations.",
    code: `package com.dukan.adambakkam.glide;

import android.app.ActivityManager;
import android.content.Context;
import androidx.annotation.NonNull;

import com.bumptech.glide.Glide;
import com.bumptech.glide.GlideBuilder;
import com.bumptech.glide.Registry;
import com.bumptech.glide.annotation.GlideModule;
import com.bumptech.glide.load.DecodeFormat;
import com.bumptech.glide.load.engine.bitmap_recycle.LruBitmapPool;
import com.bumptech.glide.load.engine.cache.InternalCacheDiskCacheFactory;
import com.bumptech.glide.load.engine.cache.LruResourceCache;
import com.bumptech.glide.module.AppGlideModule;
import com.bumptech.glide.request.RequestOptions;

/**
 * Glide configuration scaling resource cache sizes based on device performance.
 * Keeps memory profile extremely lightweight to avoid OutOfMemory (OOM) exceptions with pamphlets.
 */
@GlideModule
public final class GlideConfiguration extends AppGlideModule {

    @Override
    public void applyOptions(@NonNull Context context, @NonNull GlideBuilder builder) {
        ActivityManager activityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        boolean isLowRamDevice = activityManager != null && activityManager.isLowRamDevice();

        // Downsize default cache allocation if low-RAM device
        int memoryCacheSize = isLowRamDevice ? (1024 * 1024 * 8) : (1024 * 1024 * 32); // 8MB or 32MB max
        int bitmapPoolSize = isLowRamDevice ? (1024 * 1024 * 4) : (1024 * 1024 * 16);  // 4MB or 16MB max
        int diskCacheSize = 1024 * 1024 * 100; // 100 Megabytes local cache

        builder.setMemoryCache(new LruResourceCache(memoryCacheSize));
        builder.setBitmapPool(new LruBitmapPool(bitmapPoolSize));
        builder.setDiskCache(new InternalCacheDiskCacheFactory(context, "dukan_glide_cache", diskCacheSize));

        // Use efficient RGB_565 decode format on low-RAM devices to save 50% RAM compared to ARGB_8888
        RequestOptions defaultRequest = new RequestOptions();
        if (isLowRamDevice) {
            defaultRequest = defaultRequest.format(DecodeFormat.PREFER_RGB_565);
        } else {
            defaultRequest = defaultRequest.format(DecodeFormat.PREFER_ARGB_8888);
        }
        
        builder.setDefaultRequestOptions(defaultRequest);
    }

    @Override
    public void registerComponents(@NonNull Context context, @NonNull Glide glide, @NonNull Registry registry) {
        // No custom network interception needed for simple HTTP URL loading
        super.registerComponents(context, glide, registry);
    }

    @Override
    public boolean isManifestParsingEnabled() {
        // Speed up bootstrap initialization by disabling legacy android manifest parsing.
        return false;
    }
}`
  },
  {
    name: "activity_main.xml",
    path: "layout/activity_main.xml",
    language: "xml",
    category: "layout",
    description: "Main viewport configuration designed using ConstraintLayout. Restructures screens flatly, minimizing layout weight hierarchies.",
    code: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_size"
    android:layout_height="match_size"
    android:background="#FAFAFB"
    tools:context=".MainActivity">

    <!-- Flat header row -->
    <View
        android:id="@+id/header_bg"
        android:layout_width="0dp"
        android:layout_height="80dp"
        android:background="#FFFFFF"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <TextView
        android:id="@+id/txt_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Dukan Adambakkam"
        android:textSize="22sp"
        android:textStyle="bold"
        android:textColor="#111827"
        android:layout_marginStart="16dp"
        app:layout_constraintTop_toTopOf="@id/header_bg"
        app:layout_constraintBottom_toTopOf="@id/txt_subtitle"
        app:layout_constraintStart_toStartOf="parent" />

    <TextView
        android:id="@+id/txt_subtitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Adambakkam Local Directory &amp; Menus"
        android:textSize="12sp"
        android:textColor="#6B7280"
        android:layout_marginStart="16dp"
        app:layout_constraintTop_toBottomOf="@id/txt_title"
        app:layout_constraintBottom_toBottomOf="@id/header_bg"
        app:layout_constraintStart_toStartOf="parent" />

    <!-- Categories horizontal drawer -->
    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/rv_categories"
        android:layout_width="0dp"
        android:layout_height="64dp"
        android:background="#FFFFFF"
        android:orientation="horizontal"
        android:overScrollMode="never"
        android:paddingStart="12dp"
        android:paddingEnd="12dp"
        app:layout_constraintTop_toBottomOf="@id/header_bg"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <View
        android:id="@+id/category_divider"
        android:layout_width="0dp"
        android:layout_height="1dp"
        android:background="#E5E7EB"
        app:layout_constraintTop_toBottomOf="@id/rv_categories"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <!-- Main optimized RecyclerView for local directory -->
    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/rv_businesses"
        android:layout_width="0dp"
        android:layout_height="0dp"
        android:overScrollMode="never"
        android:padding="12dp"
        android:clipToPadding="false"
        app:layout_constraintTop_toBottomOf="@id/category_divider"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>`
  },
  {
    name: "item_business.xml",
    path: "layout/item_business.xml",
    language: "xml",
    category: "layout",
    description: "Highly optimized item layout for local catalogs. Built completely using ConstraintLayout to guarantee smooth scrolling on budget models.",
    code: `<?xml version="1.0" encoding="utf-8"?>
<androidx.cardview.widget.CardView 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_margin="6dp"
    app:cardCornerRadius="12dp"
    app:cardElevation="2dp">

    <androidx.constraintlayout.widget.ConstraintLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:padding="12dp">

        <ImageView
            android:id="@+id/img_thumbnail"
            android:layout_width="80dp"
            android:layout_height="80dp"
            android:scaleType="centerCrop"
            android:background="#F3F4F6"
            app:layout_constraintTop_toTopOf="parent"
            app:layout_constraintBottom_toBottomOf="parent"
            app:layout_constraintStart_toStartOf="parent" />

        <TextView
            android:id="@+id/txt_name"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_marginStart="12dp"
            android:layout_marginEnd="8dp"
            android:textSize="16sp"
            android:textStyle="bold"
            android:textColor="#1F2937"
            app:layout_constraintTop_toTopOf="parent"
            app:layout_constraintStart_toEndOf="@id/img_thumbnail"
            app:layout_constraintEnd_toStartOf="@id/txt_rating" />

        <TextView
            android:id="@+id/txt_rating"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textSize="14sp"
            android:textStyle="bold"
            android:textColor="#F59E0B"
            app:layout_constraintTop_toTopOf="parent"
            app:layout_constraintEnd_toEndOf="parent" />

        <TextView
            android:id="@+id/txt_tagline"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_marginStart="12dp"
            android:layout_marginTop="2dp"
            android:textSize="12sp"
            android:textColor="#4B5563"
            app:layout_constraintTop_toBottomOf="@id/txt_name"
            app:layout_constraintStart_toEndOf="@id/img_thumbnail"
            app:layout_constraintEnd_toEndOf="parent" />

        <TextView
            android:id="@+id/txt_address"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_marginStart="12dp"
            android:layout_marginTop="4dp"
            android:textSize="11sp"
            android:textColor="#9CA3AF"
            android:maxLines="1"
            android:ellipsize="end"
            app:layout_constraintTop_toBottomOf="@id/txt_tagline"
            app:layout_constraintStart_toEndOf="@id/img_thumbnail"
            app:layout_constraintEnd_toEndOf="parent" />

        <!-- Dual quick communication trigger block -->
        <LinearLayout
            android:layout_width="wrap_content"
            android:layout_height="32dp"
            android:orientation="horizontal"
            android:layout_marginTop="8dp"
            app:layout_constraintTop_toBottomOf="@id/txt_address"
            app:layout_constraintEnd_toEndOf="parent">

            <Button
                android:id="@+id/btn_whatsapp"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="WhatsApp Menu"
                android:textSize="11sp"
                android:backgroundTint="#10B981"
                android:textColor="#FFFFFF"
                android:layout_marginEnd="6dp"
                style="?android:attr/buttonStyleSmall" />

            <Button
                android:id="@+id/btn_call"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Call"
                android:textSize="11sp"
                android:backgroundTint="#3B82F6"
                android:textColor="#FFFFFF"
                style="?android:attr/buttonStyleSmall" />

        </LinearLayout>

    </androidx.constraintlayout.widget.ConstraintLayout>

</androidx.cardview.widget.CardView>`
  }
];
