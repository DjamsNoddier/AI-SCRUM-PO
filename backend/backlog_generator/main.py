from backlog_generator.generator import generate_user_stories

if __name__ == "__main__":
    print("=== Backlog Generator IA ===")
    feedback = input("👉 Entrez un feedback utilisateur :\n")
    stories = generate_user_stories(feedback)
    print("\n--- Résultat ---\n")
    print(stories)
