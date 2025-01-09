### !!! 为什么用InjectRepository而不是用entityManger，见user.service.study.md

### 1. **`@InjectRepository()`**
   - 直接注入某个实体的 `Repository`。
   - 提供实体特定的增、删、改、查等操作方法（如 `.findOne()`、`.save()`、`.delete()`）。
   - 适用于直接进行特定实体操作时，代码更简洁。

   **示例：**
   ```typescript
   @InjectRepository(User)
   private userRepository: Repository<User>;

   // 使用 Repository 的方法
   const user = await this.userRepository.findOne(id);
   ```

### 2. **`@Inject(EntityManager)`**
   - 注入 `EntityManager`，它是一个通用的数据库操作工具，支持跨实体的操作。
   - 可以通过 `entityManager.getRepository()` 获取具体实体的 `Repository`，但不直接暴露实体特定的方法。
   - 适用于需要跨多个实体进行事务或复杂操作时。

   **示例：**
   ```typescript
   @Inject(EntityManager)
   private readonly entityManager: EntityManager;

   // 获取特定实体的 Repository 后操作
   const userRepository = this.entityManager.getRepository(User);
   const user = await userRepository.findOne({ where: { id } });
   ```

### 区别：
- **`@InjectRepository()`**：专门针对某个实体，操作更简洁，适合大部分常见场景。
- **`@Inject(EntityManager)`**：提供更灵活的跨实体操作，但需要额外的 `getRepository` 步骤，适合复杂操作。